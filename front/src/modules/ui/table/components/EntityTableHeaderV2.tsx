import { useRecoilValue } from 'recoil';

import { entityFieldMetadataArrayState } from '../states/entityFieldMetadataArrayState';

import { ColumnHead } from './ColumnHead';
import { SelectAllCheckbox } from './SelectAllCheckbox';

export function EntityTableHeader() {
  const fieldMetadataArray = useRecoilValue(entityFieldMetadataArrayState);

  return (
    <thead>
      <tr>
        <th
          style={{
            width: 30,
            minWidth: 30,
            maxWidth: 30,
          }}
        >
          <SelectAllCheckbox />
        </th>
        {fieldMetadataArray.map((fieldMetadata) => (
          <th
            key={fieldMetadata.columnOrder.toString()}
            style={{
              width: fieldMetadata.columnSize,
              minWidth: fieldMetadata.columnSize,
              maxWidth: fieldMetadata.columnSize,
            }}
          >
            <ColumnHead
              viewName={fieldMetadata.columnLabel}
              viewIcon={fieldMetadata.columnIcon}
            />
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
