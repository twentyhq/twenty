import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { isManyToOneRelationField } from '@/object-metadata/utils/isManyToOneRelationField';
import { recordGroupDefinitionsComponentSelector } from '@/object-record/record-group/states/selectors/recordGroupDefinitionsComponentSelector';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { recordIndexRecordGroupsAreInInitialLoadingComponentState } from '@/object-record/record-index/states/recordIndexRecordGroupsAreInInitialLoadingComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

const StyledContainer = styled.div`
  padding-inline: ${themeCssVariables.spacing[2]};
`;

const StyledPill = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

export const RecordBoardHiddenRelationGroupsPlaceholder = () => {
  const recordIndexGroupFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupFieldMetadataItemComponentState,
  );

  const recordGroupDefinitions = useAtomComponentSelectorValue(
    recordGroupDefinitionsComponentSelector,
  );

  const recordIndexRecordGroupsAreInInitialLoading = useAtomComponentStateValue(
    recordIndexRecordGroupsAreInInitialLoadingComponentState,
  );

  const isRelationGrouping =
    isDefined(recordIndexGroupFieldMetadataItem) &&
    isManyToOneRelationField(recordIndexGroupFieldMetadataItem);

  const hasHiddenRelationGroups = recordGroupDefinitions.some(
    (recordGroupDefinition) => !recordGroupDefinition.isVisible,
  );

  if (
    !isRelationGrouping ||
    recordIndexRecordGroupsAreInInitialLoading ||
    !hasHiddenRelationGroups
  ) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledPill>{t`More groups`}</StyledPill>
    </StyledContainer>
  );
};
