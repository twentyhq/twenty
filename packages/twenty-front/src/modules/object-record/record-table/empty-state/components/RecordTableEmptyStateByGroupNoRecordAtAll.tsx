import { Button, IconPlus } from 'twenty-ui';

import { useObjectLabel } from '@/object-metadata/hooks/useObjectLabel';
import { RecordIndexAddRecordInGroupDropdown } from '@/object-record/record-index/components/RecordIndexAddRecordInGroupDropdown';
import { recordIndexRecordGroupHideComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordGroupHideComponentFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useSetRecoilComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentFamilyStateV2';
import { ViewType } from '@/views/types/ViewType';

export const RecordTableEmptyStateByGroupNoRecordAtAll = () => {
  const { objectMetadataItem } = useRecordTableContextOrThrow();

  const setHideEmptyRecordGroup = useSetRecoilComponentFamilyStateV2(
    recordIndexRecordGroupHideComponentFamilyState,
    ViewType.Table,
  );

  const objectLabel = useObjectLabel(objectMetadataItem);

  const buttonTitle = `Add a ${objectLabel}`;

  const title = `Add your first ${objectLabel}`;

  const subTitle = `Use our API or add your first ${objectLabel} manually`;

  const handleButtonClick = () => {
    // When we have no records in the group, we want to show the empty state
    setHideEmptyRecordGroup(false);
  };

  return (
    <RecordTableEmptyStateDisplay
      title={title}
      subTitle={subTitle}
      animatedPlaceholderType="noRecord"
      buttonComponent={
        <RecordIndexAddRecordInGroupDropdown
          dropdownId="record-table-empty-state-add-button-dropdown"
          clickableComponent={
            <Button
              Icon={IconPlus}
              title={buttonTitle}
              variant={'secondary'}
              onClick={handleButtonClick}
            />
          }
        />
      }
    />
  );
};
