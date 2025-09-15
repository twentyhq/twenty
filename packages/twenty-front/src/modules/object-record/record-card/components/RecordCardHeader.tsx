import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import styled from '@emotion/styled';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ViewOpenRecordInType } from '@/views/types/ViewOpenRecordInType';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/components';
import { IconEye, IconEyeOff } from 'twenty-ui/display';
import { Checkbox, CheckboxVariant, LightIconButton } from 'twenty-ui/input';

export const StyledBoardCardHeader = styled.div<{
  showCompactView: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  padding-bottom: ${({ theme, showCompactView }) =>
    theme.spacing(showCompactView ? 2 : 1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  transition: padding ease-in-out 160ms;

  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

const StyledCompactIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledCheckboxContainer = styled.div`
  margin-left: auto;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  overflow: hidden;
`;

type RecordCardHeaderProps = {
  recordId: string;
  objectMetadataItem: ObjectMetadataItem;

  onTitleClick?: () => void;
  onCheckboxChange?: (value: boolean) => void;
  isCurrentCardSelected: boolean;
  recordIndexOpenRecordIn: ViewOpenRecordInType;

  onCompactIconClick?: () => void;
  isCompactView: boolean;
  isCardExpanded?: boolean;
  isCompactViewToggleable?: boolean;
  recordChipMaxWidth?: number;
  isIconHidden?: boolean;
};

export const RecordCardHeader = ({
  objectMetadataItem,
  recordId,
  onTitleClick,
  onCheckboxChange,
  isCurrentCardSelected,
  isIconHidden,
  recordIndexOpenRecordIn,
  isCompactView,
  isCompactViewToggleable = true,
  onCompactIconClick,
  isCardExpanded,
}: RecordCardHeaderProps) => {
  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const triggerEvent =
    recordIndexOpenRecordIn === ViewOpenRecordInType.SIDE_PANEL
      ? 'CLICK'
      : 'MOUSE_DOWN';

  return (
    <StyledBoardCardHeader showCompactView={isCompactView}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          {isDefined(record) && (
            <RecordChip
              objectNameSingular={objectMetadataItem.nameSingular}
              record={record}
              variant={ChipVariant.Transparent}
              isIconHidden={isIconHidden}
              onClick={() => {
                onTitleClick?.();
              }}
              triggerEvent={triggerEvent}
            />
          )}
        </StopPropagationContainer>
      </StyledRecordChipContainer>

      {isCompactView && isCompactViewToggleable && (
        <StyledCompactIconContainer className="compact-icon-container">
          <StopPropagationContainer>
            <LightIconButton
              Icon={isCardExpanded ? IconEyeOff : IconEye}
              accent="tertiary"
              onClick={() => {
                onCompactIconClick?.();
              }}
            />
          </StopPropagationContainer>
        </StyledCompactIconContainer>
      )}
      <StyledCheckboxContainer className="checkbox-container">
        <StopPropagationContainer>
          <Checkbox
            hoverable
            checked={isCurrentCardSelected}
            onChange={(value) => {
              onCheckboxChange?.(value.target.checked);
            }}
            variant={CheckboxVariant.Secondary}
          />
        </StopPropagationContainer>
      </StyledCheckboxContainer>
    </StyledBoardCardHeader>
  );
};
