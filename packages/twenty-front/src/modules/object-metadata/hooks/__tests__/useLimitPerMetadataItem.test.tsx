import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useLimitPerMetadataItem } from '@/object-metadata/hooks/useLimitPerMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SingleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/single-record-picker/states/contexts/SingleRecordPickerComponentInstanceContext';

const instanceId = 'instanceId';
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <SingleRecordPickerComponentInstanceContext.Provider value={{ instanceId }}>
    <RecoilRoot>{children}</RecoilRoot>
  </SingleRecordPickerComponentInstanceContext.Provider>
);

describe('useLimitPerMetadataItem', () => {
  const objectData: ObjectMetadataItem[] = [
    {
      createdAt: 'createdAt',
      id: 'id',
      isActive: true,
      isCustom: true,
      isSystem: true,
      isRemote: false,
      isSearchable: true,
      labelPlural: 'labelPlural',
      labelSingular: 'labelSingular',
      namePlural: 'namePlural',
      nameSingular: 'nameSingular',
      labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
      updatedAt: 'updatedAt',
      isLabelSyncedWithName: false,
      fields: [],
      indexMetadatas: [],
    },
  ];

  it('should return object with nameSingular and default limit', async () => {
    const { result } = renderHook(
      () => useLimitPerMetadataItem({ objectMetadataItems: objectData }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.limitPerMetadataItem).toStrictEqual({
      limitNameSingular: 60,
    });
  });

  it('should return an object with nameSingular and specified limit', async () => {
    const { result } = renderHook(
      () =>
        useLimitPerMetadataItem({ objectMetadataItems: objectData, limit: 30 }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.limitPerMetadataItem).toStrictEqual({
      limitNameSingular: 30,
    });
  });
});
