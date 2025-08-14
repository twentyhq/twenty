import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { type PropsWithChildren } from 'react';

export type RecordComponentInstanceContextsWrapperProps = PropsWithChildren<{
  componentInstanceId: string;
}>;

export const RecordComponentInstanceContextsWrapper = ({
  children,
}: RecordComponentInstanceContextsWrapperProps) => {
  return (
    <RecordFilterGroupsComponentInstanceContext.Provider
      value={{ instanceId: 'instanceId' }}
    >
      <RecordFiltersComponentInstanceContext.Provider
        value={{ instanceId: 'instanceId' }}
      >
        <RecordSortsComponentInstanceContext.Provider
          value={{ instanceId: 'instanceId' }}
        >
          <RecordFieldsComponentInstanceContext.Provider
            value={{ instanceId: 'instanceId' }}
          >
            {children}
          </RecordFieldsComponentInstanceContext.Provider>
        </RecordSortsComponentInstanceContext.Provider>
      </RecordFiltersComponentInstanceContext.Provider>
    </RecordFilterGroupsComponentInstanceContext.Provider>
  );
};
