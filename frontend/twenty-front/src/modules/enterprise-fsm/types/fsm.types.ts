export type WorkOrderStatus = 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export type WorkOrderPriority = 'low' | 'medium' | 'high' | 'emergency';

export type WorkOrderData = {
  id: string;
  title: string;
  description: string;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  technicianId: string;
  technicianName: string;
  customerName: string;
  location: string;
  scheduledDate: string;
  completedDate?: string;
};

export type TechnicianData = {
  id: string;
  name: string;
  specialty: string;
  status: 'available' | 'on_job' | 'off_duty';
  currentLocation: string;
  activeWorkOrders: number;
  completedToday: number;
};

export type ServiceChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

export type ServiceReportData = {
  id: string;
  workOrderId: string;
  technicianName: string;
  arrivalTime: string;
  completionTime: string;
  checklist: ServiceChecklistItem[];
  notes: string;
  photoCount: number;
  customerSignature: boolean;
};
