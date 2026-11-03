import { buildWidgetVisibilityContext } from '@/page-layout/utils/buildWidgetVisibilityContext';
import { type FieldsWidgetGroup } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { filterFieldsWidgetGroupsByConditionalDisplay } from '@/page-layout/widgets/fields/utils/filterFieldsWidgetGroupsByConditionalDisplay';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const [
  firstFieldMetadataItem,
  secondFieldMetadataItem,
  thirdFieldMetadataItem,
] = getMockObjectMetadataItemOrThrow(CoreObjectNameSingular.Company).fields;

const MOBILE_ONLY_CONDITIONAL_DISPLAY = buildDeviceConditionalDisplay('MOBILE');

const groups: FieldsWidgetGroup[] = [
  {
    id: 'general',
    name: 'General',
    position: 0,
    isVisible: true,
    fields: [
      {
        fieldMetadataItem: firstFieldMetadataItem,
        position: 0,
        isVisible: true,
        globalIndex: 0,
        conditionalDisplay: MOBILE_ONLY_CONDITIONAL_DISPLAY,
      },
      {
        fieldMetadataItem: secondFieldMetadataItem,
        position: 1,
        isVisible: true,
        globalIndex: 1,
      },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile',
    position: 1,
    isVisible: true,
    fields: [
      {
        fieldMetadataItem: thirdFieldMetadataItem,
        position: 0,
        isVisible: true,
        globalIndex: 2,
        conditionalDisplay: MOBILE_ONLY_CONDITIONAL_DISPLAY,
      },
    ],
  },
];

describe('filterFieldsWidgetGroupsByConditionalDisplay', () => {
  it('should drop hidden fields and emptied groups and renumber the global index', () => {
    const result = filterFieldsWidgetGroupsByConditionalDisplay({
      groups,
      context: buildWidgetVisibilityContext({
        isMobile: false,
        isInSidePanel: false,
      }),
    });

    expect(result.map(({ id }) => id)).toEqual(['general']);
    expect(
      result[0].fields.map(({ fieldMetadataItem, globalIndex }) => [
        fieldMetadataItem.id,
        globalIndex,
      ]),
    ).toEqual([[secondFieldMetadataItem.id, 0]]);
  });

  it('should keep every field when the rules match', () => {
    const result = filterFieldsWidgetGroupsByConditionalDisplay({
      groups,
      context: buildWidgetVisibilityContext({
        isMobile: true,
        isInSidePanel: false,
      }),
    });

    expect(
      result.flatMap(({ fields }) =>
        fields.map(({ globalIndex }) => globalIndex),
      ),
    ).toEqual([0, 1, 2]);
  });
});
