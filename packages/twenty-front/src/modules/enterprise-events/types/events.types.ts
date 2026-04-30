export type EventStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';

export type EventData = {
  id: string;
  name: string;
  type: 'conference' | 'webinar' | 'workshop' | 'meetup';
  status: EventStatus;
  date: string;
  location: string;
  registrations: number;
  capacity: number;
  budget: number;
  currency: string;
};

export type AttendeeData = {
  id: string;
  name: string;
  email: string;
  company: string;
  registeredAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
};

export type EventROIData = {
  eventId: string;
  eventName: string;
  totalCost: number;
  leadsGenerated: number;
  pipelineInfluenced: number;
  dealsWon: number;
  revenueAttributed: number;
  roi: number;
  currency: string;
};
