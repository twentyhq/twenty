import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkOrderEntity, TechnicianEntity, ServiceContractEntity, WorkOrderStatus } from './field-service.entity';

@Injectable()
export class FieldServiceService {
  constructor(
    @InjectRepository(WorkOrderEntity) private readonly woRepo: Repository<WorkOrderEntity>,
    @InjectRepository(TechnicianEntity) private readonly techRepo: Repository<TechnicianEntity>,
    @InjectRepository(ServiceContractEntity) private readonly contractRepo: Repository<ServiceContractEntity>,
  ) {}

  async createWorkOrder(workspaceId: string, data: Partial<WorkOrderEntity>): Promise<WorkOrderEntity> {
    return this.woRepo.save(this.woRepo.create({ workspaceId, ...data }));
  }

  async autoDispatch(workspaceId: string, workOrderId: string): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`Work order ${workOrderId} not found`);

    const techs = await this.techRepo.find({ where: { workspaceId, isAvailable: true } });
    if (!techs.length) throw new NotFoundException('No available technicians');

    let best = techs[0];
    if (wo.latitude && wo.longitude) {
      let minDist = Infinity;
      for (const t of techs) {
        if (t.currentLat && t.currentLng) {
          const dist = Math.sqrt(Math.pow(t.currentLat - wo.latitude, 2) + Math.pow(t.currentLng - wo.longitude, 2));
          const hasSkill = !wo.type || t.skills?.includes(wo.type);
          if (dist < minDist && hasSkill) { minDist = dist; best = t; }
        }
      }
    }

    wo.technicianId = best.id;
    wo.status = WorkOrderStatus.DISPATCHED;
    best.isAvailable = false;
    await this.techRepo.save(best);
    return this.woRepo.save(wo);
  }

  async startWork(workOrderId: string): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`WO ${workOrderId} not found`);
    wo.status = WorkOrderStatus.IN_PROGRESS;
    wo.actualStart = new Date();
    return this.woRepo.save(wo);
  }

  async completeWork(workOrderId: string, data: { signature?: string; photoIds?: string[]; partsUsed?: Array<{ partId: string; name: string; quantity: number }>; firstTimeFix?: boolean }): Promise<WorkOrderEntity> {
    const wo = await this.woRepo.findOne({ where: { id: workOrderId } });
    if (!wo) throw new NotFoundException(`WO ${workOrderId} not found`);
    wo.status = WorkOrderStatus.COMPLETED;
    wo.actualEnd = new Date();
    wo.customerSignature = data.signature ?? null;
    wo.photoIds = data.photoIds ?? null;
    wo.partsUsed = data.partsUsed ?? null;
    wo.firstTimeFix = data.firstTimeFix ?? true;

    if (wo.technicianId) {
      const tech = await this.techRepo.findOne({ where: { id: wo.technicianId } });
      if (tech) {
        tech.isAvailable = true;
        tech.completedOrders++;
        const allOrders = await this.woRepo.find({ where: { technicianId: tech.id, status: WorkOrderStatus.COMPLETED } });
        tech.firstTimeFixRate = allOrders.filter((o) => o.firstTimeFix).length / allOrders.length * 100;
        tech.avgCustomerRating = allOrders.filter((o) => o.customerRating).reduce((s, o) => s + o.customerRating, 0) / (allOrders.filter((o) => o.customerRating).length || 1);
        await this.techRepo.save(tech);
      }
    }
    return this.woRepo.save(wo);
  }

  async updateTechnicianLocation(techId: string, lat: number, lng: number): Promise<void> {
    await this.techRepo.update(techId, { currentLat: lat, currentLng: lng });
  }

  async registerTechnician(workspaceId: string, data: Partial<TechnicianEntity>): Promise<TechnicianEntity> {
    return this.techRepo.save(this.techRepo.create({ workspaceId, ...data }));
  }

  async createServiceContract(workspaceId: string, data: Partial<ServiceContractEntity>): Promise<ServiceContractEntity> {
    return this.contractRepo.save(this.contractRepo.create({ workspaceId, ...data }));
  }

  async getAnalytics(workspaceId: string): Promise<{ totalOrders: number; completed: number; ftfr: number; avgRating: number; avgResponseMinutes: number }> {
    const orders = await this.woRepo.find({ where: { workspaceId } });
    const completed = orders.filter((o) => o.status === WorkOrderStatus.COMPLETED);
    const ftfr = completed.length ? completed.filter((o) => o.firstTimeFix).length / completed.length * 100 : 0;
    const rated = completed.filter((o) => o.customerRating);
    const avgRating = rated.length ? rated.reduce((s, o) => s + o.customerRating, 0) / rated.length : 0;
    const withTimes = completed.filter((o) => o.actualStart && o.createdAt);
    const avgResponse = withTimes.length ? withTimes.reduce((s, o) => s + (o.actualStart.getTime() - o.createdAt.getTime()) / 60_000, 0) / withTimes.length : 0;
    return { totalOrders: orders.length, completed: completed.length, ftfr: Math.round(ftfr), avgRating: Math.round(avgRating * 10) / 10, avgResponseMinutes: Math.round(avgResponse) };
  }
}
