import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CRMEventEntity, EventRegistrationEntity, RegistrationStatus } from './event-management.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class EventManagementService {
  constructor(
    @InjectRepository(CRMEventEntity) private readonly eventRepo: Repository<CRMEventEntity>,
    @InjectRepository(EventRegistrationEntity) private readonly regRepo: Repository<EventRegistrationEntity>,
  ) {}

  async createEvent(workspaceId: string, data: Partial<CRMEventEntity>): Promise<CRMEventEntity> {
    return this.eventRepo.save(this.eventRepo.create({ workspaceId, ...data }));
  }

  async registerAttendee(eventId: string, contactId: string): Promise<EventRegistrationEntity> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException(`Event ${eventId} not found`);
    if (event.capacity && event.registrationCount >= event.capacity) {
      return this.regRepo.save(this.regRepo.create({ eventId, contactId, status: RegistrationStatus.WAITLIST }));
    }
    event.registrationCount++;
    await this.eventRepo.save(event);
    return this.regRepo.save(this.regRepo.create({ eventId, contactId, qrCode: randomUUID().slice(0, 8) }));
  }

  async checkIn(registrationId: string): Promise<EventRegistrationEntity> {
    const reg = await this.regRepo.findOne({ where: { id: registrationId } });
    if (!reg) throw new NotFoundException(`Registration ${registrationId} not found`);
    reg.status = RegistrationStatus.ATTENDED;
    reg.checkedInAt = new Date();
    const event = await this.eventRepo.findOne({ where: { id: reg.eventId } });
    if (event) { event.attendeeCount++; await this.eventRepo.save(event); }
    return this.regRepo.save(reg);
  }

  async checkInByQR(qrCode: string): Promise<EventRegistrationEntity> {
    const reg = await this.regRepo.findOne({ where: { qrCode } });
    if (!reg) throw new NotFoundException(`QR ${qrCode} not found`);
    return this.checkIn(reg.id);
  }

  async recordSessionAttendance(registrationId: string, sessionName: string, scorePoints: number): Promise<void> {
    const reg = await this.regRepo.findOne({ where: { id: registrationId } });
    if (!reg) return;
    const sessions = reg.sessionsAttended ?? [];
    sessions.push(sessionName);
    reg.sessionsAttended = sessions;
    reg.scoreEarned += scorePoints;
    await this.regRepo.save(reg);
  }

  async promoteWaitlist(eventId: string): Promise<number> {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!event || !event.capacity) return 0;
    const available = event.capacity - event.registrationCount;
    if (available <= 0) return 0;
    const waitlisted = await this.regRepo.find({ where: { eventId, status: RegistrationStatus.WAITLIST }, order: { createdAt: 'ASC' }, take: available });
    for (const w of waitlisted) { w.status = RegistrationStatus.REGISTERED; w.qrCode = randomUUID().slice(0, 8); await this.regRepo.save(w); }
    event.registrationCount += waitlisted.length;
    await this.eventRepo.save(event);
    return waitlisted.length;
  }

  async getROI(eventId: string): Promise<{ cost: number; leads: number; deals: number; revenue: number; roi: number }> {
    const e = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!e) throw new NotFoundException(`Event ${eventId} not found`);
    const cost = Number(e.actualCost) || 1;
    return { cost, leads: e.leadsGenerated, deals: e.dealsCreated, revenue: Number(e.revenueAttributed), roi: ((Number(e.revenueAttributed) - cost) / cost) * 100 };
  }

  async cloneEvent(eventId: string, newStartDate: Date): Promise<CRMEventEntity> {
    const original = await this.eventRepo.findOne({ where: { id: eventId } });
    if (!original) throw new NotFoundException(`Event ${eventId} not found`);
    const duration = new Date(original.endDate).getTime() - new Date(original.startDate).getTime();
    const { id, createdAt, updatedAt, registrationCount, attendeeCount, leadsGenerated, dealsCreated, revenueAttributed, ...rest } = original;
    return this.eventRepo.save(this.eventRepo.create({ ...rest, startDate: newStartDate, endDate: new Date(newStartDate.getTime() + duration), registrationCount: 0, attendeeCount: 0, leadsGenerated: 0, dealsCreated: 0, revenueAttributed: 0 }));
  }
}
