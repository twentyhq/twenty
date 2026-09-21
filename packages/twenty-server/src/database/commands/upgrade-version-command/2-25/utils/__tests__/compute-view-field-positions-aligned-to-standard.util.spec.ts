import { computeViewFieldPositionsAlignedToStandard } from 'src/database/commands/upgrade-version-command/2-25/utils/compute-view-field-positions-aligned-to-standard.util';

const STANDARD = {
  name: 0,
  subject: 1,
  status: 2,
};

describe('computeViewFieldPositionsAlignedToStandard', () => {
  it('should return nothing when the view already matches the standard layout', () => {
    expect(
      computeViewFieldPositionsAlignedToStandard({
        existingViewFields: [
          { universalIdentifier: 'name', position: 0 },
          { universalIdentifier: 'subject', position: 1 },
          { universalIdentifier: 'status', position: 2 },
        ],
        standardPositionByUniversalIdentifier: STANDARD,
      }),
    ).toEqual([]);
  });

  it('should shift the pre-name layout onto the standard positions', () => {
    expect(
      computeViewFieldPositionsAlignedToStandard({
        existingViewFields: [
          { universalIdentifier: 'subject', position: 0 },
          { universalIdentifier: 'status', position: 1 },
        ],
        standardPositionByUniversalIdentifier: STANDARD,
      }),
    ).toEqual([
      { universalIdentifier: 'subject', position: 1 },
      { universalIdentifier: 'status', position: 2 },
    ]);
  });

  it('should pull a column left below the standard position back up', () => {
    expect(
      computeViewFieldPositionsAlignedToStandard({
        existingViewFields: [
          { universalIdentifier: 'name', position: -1 },
          { universalIdentifier: 'subject', position: 0 },
        ],
        standardPositionByUniversalIdentifier: STANDARD,
      }),
    ).toEqual([
      { universalIdentifier: 'name', position: 0 },
      { universalIdentifier: 'subject', position: 1 },
    ]);
  });

  it('should move unknown columns above every standard one, keeping their order', () => {
    expect(
      computeViewFieldPositionsAlignedToStandard({
        existingViewFields: [
          { universalIdentifier: 'customB', position: 5 },
          { universalIdentifier: 'subject', position: 0 },
          { universalIdentifier: 'customA', position: 1 },
        ],
        standardPositionByUniversalIdentifier: STANDARD,
      }),
    ).toEqual([
      { universalIdentifier: 'customB', position: 4 },
      { universalIdentifier: 'subject', position: 1 },
      { universalIdentifier: 'customA', position: 3 },
    ]);
  });

  it('should leave the label identifier strictly lowest in every case', () => {
    const cases = [
      [
        { universalIdentifier: 'subject', position: 0 },
        { universalIdentifier: 'status', position: 1 },
      ],
      [
        { universalIdentifier: 'name', position: -1 },
        { universalIdentifier: 'subject', position: 0 },
      ],
      [
        { universalIdentifier: 'custom', position: 0 },
        { universalIdentifier: 'subject', position: 1 },
      ],
    ];

    cases.forEach((existingViewFields) => {
      const updates = computeViewFieldPositionsAlignedToStandard({
        existingViewFields,
        standardPositionByUniversalIdentifier: STANDARD,
      });

      const finalPositions = existingViewFields.map(
        ({ universalIdentifier, position }) =>
          updates.find(
            (update) => update.universalIdentifier === universalIdentifier,
          )?.position ?? position,
      );
      const namePosition = STANDARD.name;

      finalPositions.forEach((position, index) => {
        if (existingViewFields[index].universalIdentifier === 'name') {
          return;
        }

        expect(position).toBeGreaterThan(namePosition);
      });
    });
  });

  it('should return nothing when the standard layout is unknown', () => {
    expect(
      computeViewFieldPositionsAlignedToStandard({
        existingViewFields: [{ universalIdentifier: 'subject', position: 0 }],
        standardPositionByUniversalIdentifier: {},
      }),
    ).toEqual([]);
  });
});
