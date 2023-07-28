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
            key={fieldMetadata.fieldName.toString()}
            style={{
              width: fieldMetadata.columnSize,
              minWidth: fieldMetadata.columnSize,
              maxWidth: fieldMetadata.columnSize,
            }}
          >
            <ColumnHead
              viewName={fieldMetadata.label}
              viewIcon={fieldMetadata.icon}
            />
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
