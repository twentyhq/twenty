import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { renameLegacyExpressionToCurrentFieldNames } from 'src/database/commands/upgrade-version-command/2-65/utils/rename-legacy-expression-to-current-field-names.util';

const FIELDS = [
  {
    name: 'phase',
    type: FieldMetadataType.SELECT,
    universalIdentifier: 'opportunity-stage',
  },
  {
    name: 'account',
    type: FieldMetadataType.RELATION,
    universalIdentifier: 'opportunity-company',
    relationType: RelationType.MANY_TO_ONE,
    relationTargetFields: [
      {
        name: 'headcount',
        type: FieldMetadataType.NUMBER,
        universalIdentifier: 'company-employees',
      },
    ],
  },
];

describe('renameLegacyExpressionToCurrentFieldNames', () => {
  it('should print each bound path with the current names of its fields', () => {
    expect(
      renameLegacyExpressionToCurrentFieldNames({
        expression:
          "stage == 'WON' and previous.stage != 'WON' and company.employees > 100",
        bindings: {
          stage: 'opportunity-stage',
          'previous.stage': 'opportunity-stage',
          company: 'opportunity-company',
          'company.employees': 'company-employees',
        },
        fields: FIELDS,
      }),
    ).toBe(
      "phase == 'WON' and previous.phase != 'WON' and account.headcount > 100",
    );
  });

  it('should leave strings, functions and unbound paths as written', () => {
    expect(
      renameLegacyExpressionToCurrentFieldNames({
        expression: "isDefined(stage) and name == 'stage'",
        bindings: { stage: 'opportunity-stage' },
        fields: FIELDS,
      }),
    ).toBe("isDefined(phase) and name == 'stage'");
  });
});
