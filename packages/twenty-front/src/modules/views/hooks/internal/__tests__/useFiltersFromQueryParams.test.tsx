import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const companyObject = getMockObjectMetadataItemOrThrow('company');
const personObject = getMockObjectMetadataItemOrThrow('person');
const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObject,
  fieldName: 'people',
});
const companyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: personObject,
  fieldName: 'company',
});
const nameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: companyObject,
  fieldName: 'name',
});

const renderFiltersFromQueryParams = (search: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => {
    setTestObjectMetadataItemsInMetadataStore(jotaiStore, [
      companyObject,
      personObject,
    ]);

    return (
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={[`/objects/companies${search}`]}>
          <Routes>
            <Route path="/objects/:objectNamePlural" element={children} />
          </Routes>
        </MemoryRouter>
      </JotaiProvider>
    );
  };

  return renderHook(() => useFiltersFromQueryParams(), { wrapper });
};

describe('useFiltersFromQueryParams', () => {
  it('should preserve composite sub-field filters', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[address.addressCity][IS]=Paris',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      subFieldName: 'addressCity',
      value: 'Paris',
    });
    expect(filters[0].relationTargetFieldMetadataId).toBeUndefined();
  });

  it('should preserve direct relation filters', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[people][IS][selectedRecordIds][0]=person-id',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      fieldMetadataId: peopleField.id,
      value: JSON.stringify({ selectedRecordIds: ['person-id'] }),
    });
    expect(filters[0].relationTargetFieldMetadataId).toBeUndefined();
  });

  it('should read a dotted relation field name as a traversal filter', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[people.company][IS][selectedRecordIds][0]=person-id',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      fieldMetadataId: peopleField.id,
      relationTargetFieldMetadataId: companyField.id,
      value: JSON.stringify({ selectedRecordIds: ['person-id'] }),
    });
  });

  it('should not set a traversal when the dotted part is not a field of the related object', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[people.unknownField][IS][selectedRecordIds][0]=person-id',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toEqual([]);
  });

  it('should keep reading a plain field name as a direct filter', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[name][CONTAINS]=Twenty',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      fieldMetadataId: nameField.id,
    });
    expect(filters[0].relationTargetFieldMetadataId).toBeUndefined();
  });
});
