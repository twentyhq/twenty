import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import {
  ViewType as CoreViewType,
  ViewVisibility,
} from '~/generated-metadata/graphql';

const makeCoreView = (overrides = {}) => ({
  id: 'view-1',
  name: 'Test View',
  type: CoreViewType.TABLE,
  key: null,
  objectMetadataId: 'obj-1',
  isCompact: false,
  viewFields: [],
  viewFieldGroups: [],
  viewGroups: [],
  viewFilters: [],
  viewFilterGroups: [],
  viewSorts: [],
  mainGroupByFieldMetadataId: null,
  shouldHideEmptyGroups: false,
  kanbanAggregateOperation: null,
  kanbanAggregateOperationFieldMetadataId: null,
  calendarFieldMetadataId: null,
  calendarLayout: null,
  position: 0,
  icon: 'IconTable',
  openRecordIn: null,
  anyFieldFilterValue: null,
  visibility: ViewVisibility.WORKSPACE,
  createdByUserWorkspaceId: 'user-1',
  ...overrides,
});

describe('convertCoreViewToView', () => {
  it('should convert a core view to a view with correct typename', () => {
    const result = convertCoreViewToView(makeCoreView() as any);

    expect(result.__typename).toBe('View');
    expect(result.id).toBe('view-1');
    expect(result.name).toBe('Test View');
  });

  it('should map viewFieldGroups through converter', () => {
    const coreView = makeCoreView({
      viewFieldGroups: [
        {
          id: 'group-1',
          name: 'Group 1',
          position: 0,
          isVisible: true,
          viewId: 'view-1',
          viewFields: [
            {
              id: 'vf-1',
              fieldMetadataId: 'fm-1',
              position: 0,
              isVisible: true,
              size: 150,
              aggregateOperation: null,
            },
          ],
        },
      ],
    });

    const result = convertCoreViewToView(coreView as any);

    expect(result.viewFieldGroups).toHaveLength(1);
    expect(result.viewFieldGroups![0].__typename).toBe('ViewFieldGroup');
    expect(result.viewFieldGroups![0].id).toBe('group-1');
    expect(result.viewFieldGroups![0].viewFields).toHaveLength(1);
  });

  it('should handle null kanban fields', () => {
    const result = convertCoreViewToView(
      makeCoreView({
        kanbanAggregateOperation: null,
        kanbanAggregateOperationFieldMetadataId: null,
      }) as any,
    );

    expect(result.kanbanAggregateOperation).toBeNull();
    expect(result.kanbanAggregateOperationFieldMetadataId).toBeNull();
  });

  it('should default visibility to UNLISTED when not provided', () => {
    const result = convertCoreViewToView(
      makeCoreView({ visibility: undefined }) as any,
    );

    expect(result.visibility).toBe(ViewVisibility.UNLISTED);
  });
});
