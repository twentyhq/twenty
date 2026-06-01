import { SHAHRYAR_APP_PATHS } from '@/shahryar/constants/shahryar-routes';
import {
  SHAHRYAR_RECORD_SECTIONS,
  buildInitialShahryarCanCreateByPath,
  buildInitialShahryarRowsByPath,
  buildShahryarCanCreateByPath,
  buildShahryarRecordRow,
  buildShahryarRowsByPath,
  getDefaultShahryarRecordFormValues,
} from '@/shahryar/utils/shahryarRecordSectionUtils';

const findSectionOrThrow = (path: string) => {
  const section = SHAHRYAR_RECORD_SECTIONS.find(
    (sectionItem) => sectionItem.path === path,
  );

  if (section === undefined) {
    throw new Error(`Missing Shahryar section for ${path}`);
  }

  return section;
};

describe('shahryarRecordSectionUtils', () => {
  it('builds a full market creation row with PRD fields', () => {
    const marketSection = findSectionOrThrow(SHAHRYAR_APP_PATHS.Markets);

    expect(
      buildShahryarRecordRow({
        section: marketSection,
        values: {
          name: 'مارکێتی نوێ',
          ownerName: 'ڕێباز عەلی',
          phoneNumber: '0750 000 0004',
          marketAddress: 'سلێمانی، بازاڕی نوێ',
          gpsLocation: '35.557, 45.435',
          shopPhoto: 'shop.jpg',
          paymentStatus: 'بەشێک دراوە',
          notes: 'پێویستی بە سەردان هەیە',
        },
      }),
    ).toEqual([
      'مارکێتی نوێ',
      'ڕێباز عەلی',
      '0750 000 0004',
      'سلێمانی، بازاڕی نوێ',
      '35.557, 45.435',
      'shop.jpg',
      'بەشێک دراوە',
      'پێویستی بە سەردان هەیە',
    ]);
  });

  it('builds a supervisor visit check-in row with GPS, photo, decision and report', () => {
    const visitSection = findSectionOrThrow(
      SHAHRYAR_APP_PATHS.SupervisorVisits,
    );

    expect(
      buildShahryarRecordRow({
        section: visitSection,
        values: {
          supervisor: 'کاروان',
          market: 'مارکێتی ئارام',
          checkInAt: '11:15',
          gpsLocation: '36.191, 44.009',
          visitPhoto: 'visit.jpg',
          soldCartons: '12',
          issue: 'قەرز ماوە',
          decisionMaker: 'تەدمین',
          requestDetails: '4 کارتۆن',
          report: 'سەردان تەواو بوو',
        },
      }),
    ).toEqual([
      'کاروان',
      'مارکێتی ئارام',
      '11:15',
      '36.191, 44.009',
      'visit.jpg',
      '12',
      'قەرز ماوە',
      'تەدمین',
      '4 کارتۆن',
      'سەردان تەواو بوو',
    ]);
  });

  it('keeps initial rows isolated by section path', () => {
    const rowsByPath = buildInitialShahryarRowsByPath();
    const paymentSection = findSectionOrThrow(SHAHRYAR_APP_PATHS.Payments);

    expect(rowsByPath[SHAHRYAR_APP_PATHS.Payments]).toEqual(
      paymentSection.rows,
    );
    expect(rowsByPath[SHAHRYAR_APP_PATHS.Markets]).not.toBe(
      rowsByPath[SHAHRYAR_APP_PATHS.Payments],
    );
    expect(rowsByPath[SHAHRYAR_APP_PATHS.WorkingTimes]).toEqual(
      findSectionOrThrow(SHAHRYAR_APP_PATHS.WorkingTimes).rows,
    );
  });

  it('replaces static rows with backend rows by section path', () => {
    const rowsByPath = buildShahryarRowsByPath([
      {
        path: SHAHRYAR_APP_PATHS.Markets,
        canCreate: false,
        rows: [['مارکێتی API']],
      },
    ]);

    expect(rowsByPath[SHAHRYAR_APP_PATHS.Markets]).toEqual([['مارکێتی API']]);
    expect(rowsByPath[SHAHRYAR_APP_PATHS.Payments]).toEqual(
      findSectionOrThrow(SHAHRYAR_APP_PATHS.Payments).rows,
    );
  });

  it('merges backend create permissions by section path', () => {
    const canCreateByPath = buildShahryarCanCreateByPath([
      {
        path: SHAHRYAR_APP_PATHS.Markets,
        canCreate: false,
        rows: [['مارکێتی API']],
      },
      {
        path: SHAHRYAR_APP_PATHS.SupervisorVisits,
        canCreate: true,
        rows: [['سەردانی API']],
      },
    ]);

    expect(canCreateByPath[SHAHRYAR_APP_PATHS.Markets]).toBe(false);
    expect(canCreateByPath[SHAHRYAR_APP_PATHS.SupervisorVisits]).toBe(true);
    expect(canCreateByPath[SHAHRYAR_APP_PATHS.Absences]).toBe(
      findSectionOrThrow(SHAHRYAR_APP_PATHS.Absences).canCreate,
    );
  });

  it('defaults create permissions from static sections', () => {
    const canCreateByPath = buildInitialShahryarCanCreateByPath();

    expect(canCreateByPath[SHAHRYAR_APP_PATHS.Markets]).toBe(
      findSectionOrThrow(SHAHRYAR_APP_PATHS.Markets).canCreate,
    );
  });

  it('creates default form values from each section field definition', () => {
    const visitSection = findSectionOrThrow(
      SHAHRYAR_APP_PATHS.SupervisorVisits,
    );

    expect(getDefaultShahryarRecordFormValues(visitSection)).toMatchObject({
      supervisor: 'کاروان',
      market: 'مارکێتی ئارام',
      checkInAt: '09:00',
      gpsLocation: '36.191, 44.009',
      decisionMaker: 'تەدمین',
    });
  });
});
