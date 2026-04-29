import { type FlatViewField } from '@/metadata-store/types/FlatViewField';
import { type FlatViewFieldGroup } from '@/metadata-store/types/FlatViewFieldGroup';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { buildFieldsWidgetGroupsFromFlatViewData } from '@/page-layout/utils/buildFieldsWidgetGroupsFromFlatViewData';
import { FieldMetadataType } from 'twenty-shared/types';

const createFieldMetadata = (
  overrides: Partial<FieldMetadataItem> & { id: string },
): FieldMetadataItem =>
  ({
    name: 'field',
    label: 'Field',
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
    ...overrides,
  }) as FieldMetadataItem;

const createFlatViewField = (
  overrides: Partial<FlatViewField> & {
    id: string;
    fieldMetadataId: string;
    viewId: string;
  },
): FlatViewField =>
  ({
    position: 0,
    isVisible: true,
    isActive: true,
    ...overrides,
  }) as FlatViewField;

const createFlatViewFieldGroup = (
  overrides: Partial<FlatViewFieldGroup> & { id: string },
): FlatViewFieldGroup =>
  ({
    name: 'Group',
    position: 0,
    isVisible: true,
    ...overrides,
  }) as FlatViewFieldGroup;

describe('buildFieldsWidgetGroupsFromFlatViewData', () => {
  const fm1 = createFieldMetadata({ id: 'fm-1', name: 'name', label: 'Name' });
  const fm2 = createFieldMetadata({
    id: 'fm-2',
    name: 'email',
    label: 'Email',
  });
  const fm3 = createFieldMetadata({
    id: 'fm-3',
    name: 'phone',
    label: 'Phone',
  });

  describe('ungrouped mode', () => {
    it('should return ungrouped fields sorted by position when no groups exist', () => {
      const flatViewFields = [
        createFlatViewField({
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          viewId: 'v1',
          position: 1,
        }),
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 0,
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [],
        flatViewFields,
        fieldMetadataItems: [fm1, fm2],
      });

      expect(result.editorMode).toBe('ungrouped');
      expect(result.groups).toEqual([]);
      expect(result.ungroupedFields).toHaveLength(2);
      expect(result.ungroupedFields[0].fieldMetadataItem.id).toBe('fm-1');
      expect(result.ungroupedFields[1].fieldMetadataItem.id).toBe('fm-2');
    });

    it('should assign sequential globalIndex based on sorted position', () => {
      const flatViewFields = [
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 5,
        }),
        createFlatViewField({
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          viewId: 'v1',
          position: 2,
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [],
        flatViewFields,
        fieldMetadataItems: [fm1, fm2],
      });

      expect(result.ungroupedFields[0].globalIndex).toBe(0);
      expect(result.ungroupedFields[0].fieldMetadataItem.id).toBe('fm-2');
      expect(result.ungroupedFields[1].globalIndex).toBe(1);
      expect(result.ungroupedFields[1].fieldMetadataItem.id).toBe('fm-1');
    });

    it('should skip fields whose fieldMetadataId has no matching metadata', () => {
      const flatViewFields = [
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 0,
        }),
        createFlatViewField({
          id: 'vf-orphan',
          fieldMetadataId: 'fm-nonexistent',
          viewId: 'v1',
          position: 1,
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [],
        flatViewFields,
        fieldMetadataItems: [fm1],
      });

      expect(result.ungroupedFields).toHaveLength(1);
      expect(result.ungroupedFields[0].fieldMetadataItem.id).toBe('fm-1');
    });

    it('should return empty ungroupedFields when there are no view fields', () => {
      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [],
        flatViewFields: [],
        fieldMetadataItems: [fm1],
      });

      expect(result.editorMode).toBe('ungrouped');
      expect(result.ungroupedFields).toHaveLength(0);
    });
  });

  describe('grouped mode', () => {
    it('should return grouped fields when groups exist', () => {
      const group1 = createFlatViewFieldGroup({
        id: 'g1',
        name: 'General',
        position: 0,
      });
      const group2 = createFlatViewFieldGroup({
        id: 'g2',
        name: 'Details',
        position: 1,
      });

      const flatViewFields = [
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 0,
          viewFieldGroupId: 'g1',
        }),
        createFlatViewField({
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          viewId: 'v1',
          position: 0,
          viewFieldGroupId: 'g2',
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [group1, group2],
        flatViewFields,
        fieldMetadataItems: [fm1, fm2],
      });

      expect(result.editorMode).toBe('grouped');
      expect(result.ungroupedFields).toEqual([]);
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].name).toBe('General');
      expect(result.groups[0].fields).toHaveLength(1);
      expect(result.groups[0].fields[0].fieldMetadataItem.id).toBe('fm-1');
      expect(result.groups[1].name).toBe('Details');
      expect(result.groups[1].fields[0].fieldMetadataItem.id).toBe('fm-2');
    });

    it('should sort fields within each group by position', () => {
      const group = createFlatViewFieldGroup({ id: 'g1', name: 'All' });

      const flatViewFields = [
        createFlatViewField({
          id: 'vf-3',
          fieldMetadataId: 'fm-3',
          viewId: 'v1',
          position: 2,
          viewFieldGroupId: 'g1',
        }),
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 0,
          viewFieldGroupId: 'g1',
        }),
        createFlatViewField({
          id: 'vf-2',
          fieldMetadataId: 'fm-2',
          viewId: 'v1',
          position: 1,
          viewFieldGroupId: 'g1',
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [group],
        flatViewFields,
        fieldMetadataItems: [fm1, fm2, fm3],
      });

      expect(
        result.groups[0].fields.map((f) => f.fieldMetadataItem.id),
      ).toEqual(['fm-1', 'fm-2', 'fm-3']);
    });

    it('should skip fields with missing metadata in grouped mode', () => {
      const group = createFlatViewFieldGroup({ id: 'g1', name: 'All' });

      const flatViewFields = [
        createFlatViewField({
          id: 'vf-1',
          fieldMetadataId: 'fm-1',
          viewId: 'v1',
          position: 0,
          viewFieldGroupId: 'g1',
        }),
        createFlatViewField({
          id: 'vf-orphan',
          fieldMetadataId: 'fm-nonexistent',
          viewId: 'v1',
          position: 1,
          viewFieldGroupId: 'g1',
        }),
      ];

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [group],
        flatViewFields,
        fieldMetadataItems: [fm1],
      });

      expect(result.groups[0].fields).toHaveLength(1);
    });

    it('should preserve group visibility in the output', () => {
      const group = createFlatViewFieldGroup({
        id: 'g1',
        name: 'Hidden Group',
        isVisible: false,
      });

      const result = buildFieldsWidgetGroupsFromFlatViewData({
        flatViewFieldGroups: [group],
        flatViewFields: [],
        fieldMetadataItems: [],
      });

      expect(result.groups[0].isVisible).toBe(false);
    });
  });
});
