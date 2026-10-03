import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { getFieldMetadataItemCopyFormValues } from '~/pages/settings/data-model/utils/getFieldMetadataItemCopyFormValues';

describe('getFieldMetadataItemCopyFormValues', () => {
  it('copies the field configuration and derives the name from the label', () => {
    const fieldMetadataItem = {
      id: 'field-priority',
      name: 'customPriorityName',
      label: 'Deal Priority',
      icon: 'IconFlag',
      description: 'How urgent the deal is',
      type: FieldMetadataType.SELECT,
      isUnique: false,
      defaultValue: "'HIGH'",
      options: [
        {
          id: '11111111-1111-4111-8111-111111111112',
          label: 'Low',
          value: 'LOW',
          color: 'green',
          position: 1,
        },
        {
          id: '11111111-1111-4111-8111-111111111111',
          label: 'High',
          value: 'HIGH',
          color: 'red',
          position: 0,
        },
      ],
    } as FieldMetadataItem;

    const copyFormValues =
      getFieldMetadataItemCopyFormValues(fieldMetadataItem);

    expect(copyFormValues).toMatchObject({
      type: FieldMetadataType.SELECT,
      icon: 'IconFlag',
      label: 'Deal Priority',
      name: 'dealPriority',
      description: 'How urgent the deal is',
      defaultValue: "'HIGH'",
      isUnique: false,
      options: [
        { label: 'High', value: 'HIGH', color: 'red', position: 0 },
        { label: 'Low', value: 'LOW', color: 'green', position: 1 },
      ],
    });
  });

  it('keeps the API name when it is not synced with the label', () => {
    const fieldMetadataItem = {
      name: 'customPriorityName',
      label: 'Deal Priority',
      type: FieldMetadataType.TEXT,
      isLabelSyncedWithName: false,
    } as FieldMetadataItem;

    expect(getFieldMetadataItemCopyFormValues(fieldMetadataItem)).toMatchObject(
      { name: 'customPriorityName', isLabelSyncedWithName: false },
    );
  });

  it('gives copied options new ids', () => {
    const fieldMetadataItem = {
      label: 'Stage',
      type: FieldMetadataType.MULTI_SELECT,
      options: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          label: 'New',
          value: 'NEW',
          color: 'blue',
          position: 0,
        },
      ],
    } as FieldMetadataItem;

    const [copiedOption] =
      getFieldMetadataItemCopyFormValues(fieldMetadataItem).options ?? [];

    expect(copiedOption.id).not.toEqual('11111111-1111-4111-8111-111111111111');
  });

  it('falls back to the default icon of the field type', () => {
    const fieldMetadataItem = {
      label: 'Amount',
      type: FieldMetadataType.CURRENCY,
      icon: null,
    } as FieldMetadataItem;

    const copyFormValues =
      getFieldMetadataItemCopyFormValues(fieldMetadataItem);

    expect(copyFormValues.icon).toEqual('IconMoneybag');
    expect(copyFormValues.options).toBeUndefined();
  });
});
