import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Request } from 'express';

import { IPAllowlistEntity, IPRuleType } from './ip-allowlist.entity';
import { DeviceSessionEntity, DeviceStatus } from './device-session.entity';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(IPAllowlistEntity)
    private readonly ipRepo: Repository<IPAllowlistEntity>,
    @InjectRepository(DeviceSessionEntity)
    private readonly deviceRepo: Repository<DeviceSessionEntity>,
  ) {}

  // IP Allowlist Methods
  async createIPRule(
    workspaceId: string,
    data: Partial<IPAllowlistEntity>,
  ): Promise<IPAllowlistEntity> {
    const rule = this.ipRepo.create({ ...data, workspaceId });
    return this.ipRepo.save(rule);
  }

  async findIPRules(workspaceId: string): Promise<IPAllowlistEntity[]> {
    return this.ipRepo.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteIPRule(id: string, workspaceId: string): Promise<void> {
    await this.ipRepo.delete({ id, workspaceId });
  }

  async checkIPAccess(workspaceId: string, ipAddress: string): Promise<boolean> {
    const rules = await this.ipRepo.find({
      where: { workspaceId, status: 'active' as any },
      order: { createdAt: 'DESC' },
    });

    if (rules.length === 0) return true;

    for (const rule of rules) {
      if (this.isIPInRange(ipAddress, rule.ipAddress, rule.ipRange)) {
        return rule.ruleType === IPRuleType.ALLOW;
      }
    }

    const globalRules = await this.ipRepo.find({
      where: { isGlobal: true, status: 'active' as any },
    });

    for (const rule of globalRules) {
      if (this.isIPInRange(ipAddress, rule.ipAddress, rule.ipRange)) {
        return rule.ruleType === IPRuleType.ALLOW;
      }
    }

    return rules.every(r => r.ruleType === IPRuleType.DENY) ? false : true;
  }

  private isIPInRange(ip: string, singleIP?: string, range?: string): boolean {
    if (singleIP && ip === singleIP) return true;
    
    if (range) {
      const [baseIP, prefixLength] = range.split('/');
      const ipNum = this.ipToNumber(ip);
      const baseNum = this.ipToNumber(baseIP);
      const mask = ~((1 << (32 - parseInt(prefixLength))) - 1);
      return (ipNum & mask) === (baseNum & mask);
    }
    
    return false;
  }

  private ipToNumber(ip: string): number {
    return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
  }

  // Device Session Methods
  async createDeviceSession(
    userId: string,
    workspaceId: string,
    deviceInfo: Partial<DeviceSessionEntity>,
  ): Promise<DeviceSessionEntity> {
    const session = this.deviceRepo.create({
      ...deviceInfo,
      userId,
      workspaceId,
      status: DeviceStatus.ACTIVE,
      currentLoginAt: new Date(),
    });
    return this.deviceRepo.save(session);
  }

  async findUserDevices(userId: string, workspaceId: string): Promise<DeviceSessionEntity[]> {
    return this.deviceRepo.find({
      where: { userId, workspaceId },
      order: { currentLoginAt: 'DESC' },
    });
  }

  async revokeDevice(deviceId: string, userId: string, workspaceId: string): Promise<void> {
    await this.deviceRepo.update(
      { id: deviceId, userId, workspaceId },
      { status: DeviceStatus.REVOKED },
    );
  }

  async revokeAllDevices(userId: string, workspaceId: string, exceptCurrent?: string): Promise<void> {
    const updateData: Partial<DeviceSessionEntity> = { status: DeviceStatus.REVOKED };
    
    if (exceptCurrent) {
      await this.deviceRepo.update(
        { userId, workspaceId, id: exceptCurrent },
        { status: DeviceStatus.ACTIVE },
      );
    }
    
    await this.deviceRepo.update(
      { userId, workspaceId },
      updateData as any,
    );
  }

  async updateDeviceActivity(deviceId: string): Promise<void> {
    await this.deviceRepo.update(
      { id: deviceId },
      { lastActiveAt: new Date() },
    );
  }

  async checkDeviceAccess(userId: string, workspaceId: string, deviceId?: string): Promise<boolean> {
    if (!deviceId) return true;

    const device = await this.deviceRepo.findOne({
      where: { id: deviceId, userId, workspaceId, status: DeviceStatus.ACTIVE },
    });

    return !!device;
  }

  // Security Dashboard — active sessions, recent logins, 2FA adoption
  async getSecurityDashboard(workspaceId: string): Promise<{
    activeSessions: number;
    revokedSessions: number;
    recentLoginAttempts: DeviceSessionEntity[];
    twoFactorAdoptionRate: number;
    devicesByStatus: Record<string, number>;
  }> {
    const allDevices = await this.deviceRepo.find({ where: { workspaceId } });

    const activeSessions = allDevices.filter(
      (d) => d.status === DeviceStatus.ACTIVE,
    ).length;
    const revokedSessions = allDevices.filter(
      (d) => d.status === DeviceStatus.REVOKED,
    ).length;

    // Recent login attempts (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000);
    const recentLoginAttempts = allDevices
      .filter((d) => d.currentLoginAt && new Date(d.currentLoginAt) >= thirtyDaysAgo)
      .sort((a, b) =>
        new Date(b.currentLoginAt).getTime() - new Date(a.currentLoginAt).getTime(),
      )
      .slice(0, 50);

    // 2FA adoption: ratio of unique users with >1 active device (proxy metric)
    const userDeviceMap = new Map<string, number>();
    for (const d of allDevices.filter((d) => d.status === DeviceStatus.ACTIVE)) {
      userDeviceMap.set(d.userId, (userDeviceMap.get(d.userId) ?? 0) + 1);
    }
    const totalUsers = userDeviceMap.size;
    const usersWithMultipleDevices = [...userDeviceMap.values()].filter((c) => c > 1).length;
    const twoFactorAdoptionRate = totalUsers > 0
      ? Math.round((usersWithMultipleDevices / totalUsers) * 100)
      : 0;

    const devicesByStatus: Record<string, number> = {};
    for (const d of allDevices) {
      devicesByStatus[d.status] = (devicesByStatus[d.status] ?? 0) + 1;
    }

    return {
      activeSessions,
      revokedSessions,
      recentLoginAttempts,
      twoFactorAdoptionRate,
      devicesByStatus,
    };
  }

  // Export audit log entries as CSV or JSON
  async exportAuditLog(
    workspaceId: string,
    startDate: Date,
    endDate: Date,
    format: 'csv' | 'json',
  ): Promise<string> {
    const devices = await this.deviceRepo.find({ where: { workspaceId } });

    const entries = devices
      .filter((d) => {
        const loginDate = d.currentLoginAt ? new Date(d.currentLoginAt) : null;
        return loginDate && loginDate >= startDate && loginDate <= endDate;
      })
      .map((d) => ({
        userId: d.userId,
        deviceId: d.id,
        status: d.status,
        deviceName: d.deviceName ?? 'unknown',
        ipAddress: d.ipAddress ?? 'unknown',
        loginAt: d.currentLoginAt?.toISOString() ?? '',
        lastActiveAt: d.lastActiveAt?.toISOString() ?? '',
      }));

    if (format === 'json') {
      return JSON.stringify(entries, null, 2);
    }

    // CSV format
    if (entries.length === 0) return '';
    const headers = Object.keys(entries[0]);
    const rows = entries.map((e) =>
      headers.map((h) => `"${String((e as Record<string, string>)[h]).replace(/"/g, '""')}"`).join(','),
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
