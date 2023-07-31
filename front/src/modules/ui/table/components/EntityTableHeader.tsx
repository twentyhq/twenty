import { useRecoilValue } from 'recoil';

import { viewFieldsFamilyState } from '../states/viewFieldsState';

import { ColumnHead } from './ColumnHead';
import { SelectAllCheckbox } from './SelectAllCheckbox';

export function EntityTableHeader() {
  const viewFields = useRecoilValue(viewFieldsFamilyState);

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
        {viewFields.map((viewField) => (
          <th
            key={viewField.columnOrder.toString()}
            style={{
              width: viewField.columnSize,
              minWidth: viewField.columnSize,
              maxWidth: viewField.columnSize,
            }}
          >
            <ColumnHead
              viewName={viewField.columnLabel}
              viewIcon={viewField.columnIcon}
            />
          </th>
        ))}
        <th></th>
      </tr>
    </thead>
  );
}
