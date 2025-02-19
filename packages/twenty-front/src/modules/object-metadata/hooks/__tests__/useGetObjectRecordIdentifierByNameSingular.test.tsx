import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('useGetObjectRecordIdentifierByNameSingular', () => {
  it('should work as expected', async () => {
    const { result, rerender } = renderHook(
      ({
        record,
        objectNameSingular,
      }: {
        record: any;
        objectNameSingular: string;
      }) => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(generatedMockObjectMetadataItems);

        return useGetObjectRecordIdentifierByNameSingular()(
          record,
          objectNameSingular,
        );
      },
      {
        wrapper: RecoilRoot,
        initialProps: {
          record: { id: 'recordId' } as any,
          objectNameSingular: 'viewSort',
        },
      },
    );

    expect(result.current.linkToShowPage).toBe('/object/viewSort/recordId');

    rerender({
      record: { id: 'recordId', avatarUrl: 'https://fake-url.com' },
      objectNameSingular: 'opportunity',
    });

    expect(result.current.linkToShowPage).toBe('/object/opportunity/recordId');

    rerender({
      record: {
        id: 'recordId',
        name: { firstName: 'John', lastName: 'Connor' },
      },
      objectNameSingular: 'person',
    });

    expect(result.current.linkToShowPage).toBe('/object/person/recordId');
    expect(result.current.name).toBe('John Connor');
    expect(result.current.avatarType).toBe('rounded');

    rerender({
      record: {
        id: 'recordId',
        domainName: 'https://cool-company.com',
      },
      objectNameSingular: 'company',
    });

    expect(result.current.linkToShowPage).toBe('/object/company/recordId');
    expect(result.current.avatarUrl).toBe(
      'https://twenty-icons.com/cool-company.com',
    );
    expect(result.current.avatarType).toBe('squared');
  });
});
