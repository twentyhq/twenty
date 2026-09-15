import { type RecordOutputSchemaV2 } from '@/workflow/workflow-variables/types/RecordOutputSchemaV2';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { filterOutputSchema } from '@/workflow/workflow-variables/utils/filterOutputSchema';
import { getVariableTemplateFromPath } from '@/workflow/workflow-variables/utils/getVariableTemplateFromPath';
import { searchWorkflowVariables } from '@/workflow/workflow-variables/utils/searchWorkflowVariables';
import { FieldMetadataType } from 'twenty-shared/types';

const COMPANY_SCHEMA: RecordOutputSchemaV2 = {
  _outputSchemaType: 'RECORD',
  object: { label: 'Company', objectMetadataId: 'company' },
  fields: {
    name: {
      isLeaf: true,
      label: 'Company name',
      type: FieldMetadataType.TEXT,
      value: 'Acme',
      fieldMetadataId: 'name',
      isCompositeSubField: false,
    },
    employees: {
      isLeaf: true,
      label: 'Employees',
      type: FieldMetadataType.NUMBER,
      value: 10,
      fieldMetadataId: 'employees',
      isCompositeSubField: false,
    },
  },
};

const STEPS: StepOutputSchemaV2[] = [
  {
    id: 'trigger',
    name: 'Record created',
    type: 'DATABASE_EVENT',
    outputSchema: COMPANY_SCHEMA,
  },
  {
    id: 'find',
    name: 'Find companies',
    type: 'FIND_RECORDS',
    outputSchema: {
      first: { isLeaf: false, label: 'First record', value: COMPANY_SCHEMA },
      all: undefined,
      totalCount: {
        isLeaf: true,
        label: 'Total count',
        type: 'number',
        value: 1,
      },
    },
  },
];

describe('searchWorkflowVariables', () => {
  it('searches only the current subtree while preserving full variable paths', () => {
    const results = searchWorkflowVariables({
      steps: [STEPS[1]],
      currentPath: ['first'],
      searchInputValue: 'company name',
    });

    expect(results).toEqual([
      expect.objectContaining({
        path: ['first', 'name'],
        breadcrumb: 'Find companies / First record',
      }),
    ]);
    expect(
      searchWorkflowVariables({
        steps: [STEPS[1]],
        currentPath: ['first'],
        searchInputValue: 'total count',
      }),
    ).toEqual([]);
  });

  it('finds whole records using their configured identifier field', () => {
    const results = searchWorkflowVariables({
      steps: [
        {
          ...STEPS[0],
          outputSchema: {
            ...COMPANY_SCHEMA,
            object: { ...COMPANY_SCHEMA.object, fieldIdName: 'companyId' },
            fields: {},
          },
        },
      ],
      searchInputValue: ' COMPANY ',
      shouldDisplayRecordObjects: true,
    });

    expect(results).toEqual([
      expect.objectContaining({
        path: ['companyId'],
        label: 'Company',
        isLeaf: true,
        isFullRecord: true,
      }),
    ]);
  });

  it('respects allowed record types without hiding eligible field values', () => {
    const objectMetadataItems = [
      {
        id: 'company',
        nameSingular: 'company',
        labelSingular: 'Business',
        icon: 'IconBuildingSkyscraper',
        color: 'blue',
        isSystem: false,
      },
    ];
    const search = (objectNameSingularsToSelect: string[]) =>
      searchWorkflowVariables({
        steps: STEPS,
        searchInputValue: 'business',
        shouldDisplayRecordObjects: true,
        objectMetadataItems,
        objectNameSingularsToSelect,
      });

    const companyResults = search(['company']);

    expect(companyResults.map((result) => result.path)).toEqual([
      ['id'],
      ['first', 'id'],
    ]);
    expect(companyResults).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          label: 'Business',
          icon: 'IconBuildingSkyscraper',
          iconColor: 'blue',
        }),
      ]),
    );
    expect(search(['person'])).toEqual([]);
    expect(
      searchWorkflowVariables({
        steps: STEPS,
        searchInputValue: 'Business',
        objectMetadataItems,
      }),
    ).toEqual([]);
    expect(
      searchWorkflowVariables({
        steps: STEPS,
        searchInputValue: 'Company name',
        shouldDisplayRecordObjects: true,
        objectMetadataItems,
        objectNameSingularsToSelect: ['person'],
      }),
    ).toHaveLength(2);
  });

  it('finds matching fields across steps and nested records with their source paths', () => {
    const results = searchWorkflowVariables({
      steps: STEPS,
      searchInputValue: '  COMPANY NAME  ',
    });

    expect(results).toEqual([
      expect.objectContaining({
        stepId: 'trigger',
        path: ['name'],
        label: 'Company name',
        breadcrumb: 'Record created',
        isLeaf: true,
      }),
      expect.objectContaining({
        stepId: 'find',
        path: ['first', 'name'],
        label: 'Company name',
        breadcrumb: 'Find companies / First record',
        isLeaf: true,
      }),
    ]);
    expect(
      results.map((result) =>
        getVariableTemplateFromPath({
          stepId: result.stepId,
          path: result.path,
        }),
      ),
    ).toEqual(['{{trigger.name}}', '{{find.first.name}}']);
  });

  it.each(['', '   ', 'missing field'])(
    'returns no field results for %j',
    (searchInputValue) => {
      expect(
        searchWorkflowVariables({ steps: STEPS, searchInputValue }),
      ).toEqual([]);
    },
  );

  it('keeps matching containers navigable rather than treating them as values', () => {
    expect(
      searchWorkflowVariables({ steps: STEPS, searchInputValue: 'first' }),
    ).toEqual([
      expect.objectContaining({
        stepId: 'find',
        path: ['first'],
        isLeaf: false,
      }),
    ]);
  });

  it('uses only the supplied filtered schemas', () => {
    const outputSchema = filterOutputSchema({
      outputSchema: COMPANY_SCHEMA,
      shouldDisplayRecordFields: true,
      shouldDisplayRecordObjects: true,
      fieldTypesToExclude: [FieldMetadataType.TEXT],
    });

    expect(
      searchWorkflowVariables({
        steps: [{ ...STEPS[0], outputSchema: outputSchema ?? {} }],
        searchInputValue: 'Company name',
      }),
    ).toEqual([]);
    expect(
      searchWorkflowVariables({
        steps: [STEPS[1]],
        searchInputValue: 'Company name',
      }).map((result) => result.stepId),
    ).toEqual(['find']);
  });

  it('does not generate variable values for links to configure missing outputs', () => {
    expect(
      searchWorkflowVariables({
        steps: [
          {
            id: 'code',
            name: 'Run code',
            type: 'CODE',
            outputSchema: {
              _outputSchemaType: 'LINK',
              link: { isLeaf: true, label: 'Test code', tab: 'test' },
            },
          },
        ],
        searchInputValue: 'test',
      }),
    ).toEqual([
      expect.objectContaining({
        stepId: 'code',
        path: [],
        label: 'Test code',
        isLeaf: false,
      }),
    ]);
  });

  it('finds whole lists and retains numeric array paths', () => {
    const step: StepOutputSchemaV2 = {
      id: 'code',
      name: 'Run code',
      type: 'CODE',
      outputSchema: {
        '0': { isLeaf: true, type: 'string', label: '0', value: 'Acme' },
      },
    };
    expect(
      searchWorkflowVariables({
        steps: [step],
        searchInputValue: 'whole list',
      }),
    ).toEqual([expect.objectContaining({ path: [], isLeaf: true })]);
    const [result] = searchWorkflowVariables({
      steps: [step],
      searchInputValue: '0',
    });
    expect(
      getVariableTemplateFromPath({ stepId: result.stepId, path: result.path }),
    ).toBe('{{code.0}}');
    expect(
      searchWorkflowVariables({
        steps: [step],
        searchInputValue: 'whole list',
        shouldDisplaySpecialItems: false,
      }),
    ).toEqual([]);
  });

  it('searches iterator records without treating iterator status values as schema nodes', () => {
    const step: StepOutputSchemaV2 = {
      id: 'loop',
      name: 'Loop companies',
      type: 'ITERATOR',
      outputSchema: {
        currentItem: {
          isLeaf: false,
          label: 'Current item',
          value: COMPANY_SCHEMA,
        },
        currentItemIndex: 0,
        hasProcessedAllItems: false,
      },
    };
    expect(
      searchWorkflowVariables({
        steps: [step],
        searchInputValue: 'Company name',
      }),
    ).toEqual([
      expect.objectContaining({ path: ['currentItem', 'name'], isLeaf: true }),
    ]);
    expect(
      searchWorkflowVariables({
        steps: [step],
        searchInputValue: 'Current item',
      }).filter((result) => result.isLeaf),
    ).toEqual([
      expect.objectContaining({ path: ['currentItem'], isLeaf: true }),
    ]);
  });

  it('uses the existing variable path format for field keys', () => {
    const step: StepOutputSchemaV2 = {
      id: 'form',
      name: 'Form',
      type: 'FORM',
      outputSchema: {
        'company.name': {
          isLeaf: true,
          label: 'Company name',
          type: FieldMetadataType.TEXT,
          value: '',
        },
      },
    };
    const [result] = searchWorkflowVariables({
      steps: [step],
      searchInputValue: 'Company name',
    });
    expect(
      getVariableTemplateFromPath({ stepId: result.stepId, path: result.path }),
    ).toBe('{{form.company.name}}');
  });
});
