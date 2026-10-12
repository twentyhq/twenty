import { FieldMetadataType } from 'twenty-shared/types';

import { computeWorkflowManifestOrderBy } from 'src/engine/core-modules/application/application-manifest/utils/compute-workflow-manifest-order-by.util';
import { type WorkflowManifestFieldReference } from 'src/engine/core-modules/application/application-manifest/types/workflow-manifest-references.type';

const field: WorkflowManifestFieldReference = {
  id: 'field',
  name: 'value',
  objectUniversalIdentifier: 'company',
  type: FieldMetadataType.TEXT,
  settings: null,
  relationTargetObjectMetadataUniversalIdentifier: null,
};
const references = {
  logicFunctionIdByUniversalIdentifier: new Map<string, string>(),
};

describe('workflow manifest executable ordering', () => {
  it.each([
    [FieldMetadataType.TEXT, [{ value: 'DescNullsLast' }]],
    [
      FieldMetadataType.CURRENCY,
      [{ value: { amountMicros: 'DescNullsLast' } }],
    ],
    [
      FieldMetadataType.FULL_NAME,
      [
        { value: { firstName: 'DescNullsLast' } },
        { value: { lastName: 'DescNullsLast' } },
      ],
    ],
  ])('sorts %s fields by the runtime GraphQL shape', (type, expected) => {
    expect(
      computeWorkflowManifestOrderBy({
        field: { ...field, type },
        direction: 'DESC',
        references,
      }),
    ).toEqual(expected);
  });

  it('honors enabled address subfields', () => {
    expect(
      computeWorkflowManifestOrderBy({
        field: {
          ...field,
          type: FieldMetadataType.ADDRESS,
          settings: { subFields: ['addressCountry', 'addressCity'] },
        },
        direction: 'ASC',
        subFieldName: 'addressCountry',
        references,
      }),
    ).toEqual([{ value: { addressCountry: 'AscNullsLast' } }]);
  });

  it('sorts relations by the target label rather than a relation scalar', () => {
    expect(
      computeWorkflowManifestOrderBy({
        field: {
          ...field,
          type: FieldMetadataType.RELATION,
          relationTargetObjectMetadataUniversalIdentifier: 'person',
        },
        direction: 'ASC',
        references: {
          ...references,
          objectByUniversalIdentifier: new Map([
            [
              'person',
              {
                nameSingular: 'person',
                labelIdentifierFieldMetadataUniversalIdentifier: 'label',
              },
            ],
          ]),
          fieldByUniversalIdentifier: new Map([
            [
              'label',
              {
                ...field,
                name: 'name',
                objectUniversalIdentifier: 'person',
                type: FieldMetadataType.FULL_NAME,
              },
            ],
          ]),
        },
      }),
    ).toEqual([
      { value: { name: { firstName: 'AscNullsLast' } } },
      { value: { name: { lastName: 'AscNullsLast' } } },
    ]);
  });
});
