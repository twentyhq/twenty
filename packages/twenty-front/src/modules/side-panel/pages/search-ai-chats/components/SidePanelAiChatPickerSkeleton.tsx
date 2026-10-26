import { styled } from '@linaria/react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

const CHAT_PICKER_SKELETON_LABEL_WIDTHS = [
  themeCssVariables.spacing[32],
  themeCssVariables.spacing[28],
  themeCssVariables.spacing[24],
  themeCssVariables.spacing[30],
  themeCssVariables.spacing[26],
];

const StyledRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
`;

type SidePanelAiChatPickerSkeletonProps = {
  label: string;
  rowCount?: number;
};

export const SidePanelAiChatPickerSkeleton = ({
  label,
  rowCount = CHAT_PICKER_SKELETON_LABEL_WIDTHS.length,
}: SidePanelAiChatPickerSkeletonProps) => (
  <StyledRows role="status" aria-label={label} aria-busy="true">
    {CHAT_PICKER_SKELETON_LABEL_WIDTHS.slice(0, rowCount).map(
      (width, index) => (
        <ListItem
          key={index}
          disabled
          startIcon={
            <Skeleton
              width={themeCssVariables.spacing[6]}
              height={themeCssVariables.spacing[6]}
            />
          }
        >
          <Skeleton width={width} height={themeCssVariables.spacing[4]} />
        </ListItem>
      ),
    )}
  </StyledRows>
);
