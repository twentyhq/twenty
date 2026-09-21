import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useFiltersFromQueryParams } from '@/views/hooks/internal/useFiltersFromQueryParams';
import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const JUNCTION_OBJECT_ID = 'junction-object-id';
const LISTED_OBJECT_ID = 'listed-object-id';
const INVERSE_FIELD_ID = 'inverse-field-id';
const JUNCTION_SOURCE_FIELD_ID = 'junction-source-field-id';

const junctionSourceField = {
  id: JUNCTION_SOURCE_FIELD_ID,
  name: 'person',
  label: 'Person',
  type: FieldMetadataType.RELATION,
  isActive: true,
};

const inverseField = {
  id: INVERSE_FIELD_ID,
  name: 'members',
  label: 'Members',
  type: FieldMetadataType.RELATION,
  isActive: true,
  relation: {
    type: RelationType.ONE_TO_MANY,
    targetObjectMetadata: { id: JUNCTION_OBJECT_ID },
  },
};

const nameField = {
  id: 'name-field-id',
  name: 'name',
  label: 'Name',
  type: FieldMetadataType.TEXT,
  isActive: true,
};

const objectMetadataItems = [
  {
    id: LISTED_OBJECT_ID,
    nameSingular: 'messageList',
    namePlural: 'messageLists',
    fields: [inverseField, nameField],
    readableFields: [inverseField, nameField],
  },
  {
    id: JUNCTION_OBJECT_ID,
    nameSingular: 'messageListMember',
    namePlural: 'messageListMembers',
    fields: [junctionSourceField],
    readableFields: [junctionSourceField],
  },
];

const renderFiltersFromQueryParams = (search: string) => {
  const wrapper = ({ children }: { children: ReactNode }) => {
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      objectMetadataItems as never,
    );

    return (
      <JotaiProvider store={jotaiStore}>
        <MemoryRouter initialEntries={[`/objects/messageLists${search}`]}>
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
  it('should read a dotted relation field name as a traversal filter', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[members.person][IS][selectedRecordIds][0]=person-id',
    );

    const filters = await result.current.getFiltersFromQueryParams();

    expect(filters).toHaveLength(1);
    expect(filters[0]).toMatchObject({
      fieldMetadataId: INVERSE_FIELD_ID,
      relationTargetFieldMetadataId: JUNCTION_SOURCE_FIELD_ID,
    });
  });

  it('should not set a traversal when the dotted part is not a field of the related object', async () => {
    const { result } = renderFiltersFromQueryParams(
      '?filter[members.unknownField][IS][selectedRecordIds][0]=person-id',
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
      fieldMetadataId: 'name-field-id',
    });
    expect(filters[0].relationTargetFieldMetadataId).toBeUndefined();
  });
});
