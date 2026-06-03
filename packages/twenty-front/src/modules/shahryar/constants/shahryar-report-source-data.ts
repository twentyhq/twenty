import { type ShahryarReportSourceData } from '@/shahryar/utils/shahryarReportUtils';

type ShahryarReportInput = {
  referenceDate: Date;
  sourceData: ShahryarReportSourceData;
};

export const SHAHRYAR_REPORT_INPUT: ShahryarReportInput = {
  referenceDate: new Date('2026-06-01T12:00:00.000Z'),
  sourceData: {
    supervisors: [
      { id: '20202020-0687-4c41-b707-ed1bfca972a7', name: 'کاروان' },
      { id: '20202020-77d5-4cb6-b60a-f4a835a85d61', name: 'هەڵۆ' },
      { id: '20202020-1553-45c6-a028-5a9064cce07f', name: 'بەهروز' },
      { id: '20202020-463f-435b-828c-107e007a2711', name: 'ئەدمین' },
    ],
    markets: [
      {
        id: '20202020-0101-4000-8000-000000000001',
        name: 'مارکێتی ئارام',
        assignedSupervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        district: 'هەولێر',
        isActiveMarket: true,
      },
      {
        id: '20202020-0101-4000-8000-000000000002',
        name: 'وەکیلی زاگرۆس',
        assignedSupervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        district: 'هەولێر',
        isActiveMarket: true,
      },
      {
        id: '20202020-0101-4000-8000-000000000003',
        name: 'مارکێتی شار',
        assignedSupervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
        district: 'هەولێر',
        isActiveMarket: true,
      },
      {
        id: '20202020-0101-4000-8000-000000000004',
        name: 'مارکێتی نوێ',
        assignedSupervisorId: '20202020-463f-435b-828c-107e007a2711',
        district: 'سلێمانی',
        isActiveMarket: true,
      },
    ],
    visits: [
      {
        id: '20202020-0201-4000-8000-000000000001',
        marketId: '20202020-0101-4000-8000-000000000001',
        supervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        checkInAt: '2026-06-01T09:12:00.000Z',
        soldCartons: 18,
        requestedCartons: 4,
        report: 'سەردان تەواو بوو، پارەدان کرا.',
      },
      {
        id: '20202020-0201-4000-8000-000000000002',
        marketId: '20202020-0101-4000-8000-000000000002',
        supervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        checkInAt: '2026-06-01T10:34:00.000Z',
        soldCartons: 11,
        requestedCartons: 8,
        report: 'فرۆشتن مامناوەندە و قەرز پێویستی بە چارەسەر هەیە.',
      },
      {
        id: '20202020-0201-4000-8000-000000000003',
        marketId: '20202020-0101-4000-8000-000000000003',
        supervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
        checkInAt: '2026-06-01T12:08:00.000Z',
        soldCartons: 24,
        requestedCartons: 6,
        report: 'فرۆشتن بەرزە و کۆگاکە پێویستی بە پڕکردنەوە هەیە.',
      },
      {
        id: '20202020-0201-4000-8000-000000000004',
        marketId: '20202020-0101-4000-8000-000000000003',
        supervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
        checkInAt: '2026-05-29T12:08:00.000Z',
        soldCartons: 14,
        requestedCartons: 3,
        report: 'سەردانی هەفتەی ڕابردوو.',
      },
      {
        id: '20202020-0201-4000-8000-000000000005',
        marketId: '20202020-0101-4000-8000-000000000002',
        supervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        checkInAt: '2026-05-16T10:34:00.000Z',
        soldCartons: 9,
        requestedCartons: 2,
        report: 'سەردانی مانگی ڕابردوو.',
      },
    ],
    workingTimes: [
      {
        id: '20202020-0301-4000-8000-000000000001',
        supervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        workDate: '2026-06-01T00:00:00.000Z',
        status: 'PRESENT',
      },
      {
        id: '20202020-0301-4000-8000-000000000002',
        supervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        workDate: '2026-06-01T00:00:00.000Z',
        status: 'LATE',
      },
      {
        id: '20202020-0301-4000-8000-000000000003',
        supervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
        workDate: '2026-06-01T00:00:00.000Z',
        status: 'PRESENT',
      },
      {
        id: '20202020-0301-4000-8000-000000000004',
        supervisorId: '20202020-463f-435b-828c-107e007a2711',
        workDate: '2026-06-01T00:00:00.000Z',
        status: 'PRESENT',
      },
    ],
    payments: [
      {
        id: '20202020-0401-4000-8000-000000000001',
        amount: 1250000,
        dueDate: '2026-06-01T00:00:00.000Z',
        paidAt: '2026-06-01T00:00:00.000Z',
        status: 'CLOSED',
      },
      {
        id: '20202020-0401-4000-8000-000000000002',
        amount: 780000,
        dueDate: '2026-06-01T00:00:00.000Z',
        paidAt: null,
        status: 'OPEN',
      },
    ],
    penalties: [
      {
        id: '20202020-0501-4000-8000-000000000001',
        supervisorId: '20202020-0687-4c41-b707-ed1bfca972a7',
        amount: 25000,
        penaltyDate: '2026-06-01T00:00:00.000Z',
      },
      {
        id: '20202020-0501-4000-8000-000000000002',
        supervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        amount: 40000,
        penaltyDate: '2026-05-30T00:00:00.000Z',
      },
    ],
    absences: [
      {
        id: '20202020-0601-4000-8000-000000000001',
        supervisorId: '20202020-1553-45c6-a028-5a9064cce07f',
        absenceDate: '2026-06-01T00:00:00.000Z',
        reason: 'ABSENT',
      },
      {
        id: '20202020-0601-4000-8000-000000000002',
        supervisorId: '20202020-77d5-4cb6-b60a-f4a835a85d61',
        absenceDate: '2026-05-29T00:00:00.000Z',
        reason: 'LATE',
      },
    ],
    backupStatus: {
      label: 'سەرکەوتوو',
      lastRunLabel: 'ئەمڕۆ 02:15',
    },
  },
};
