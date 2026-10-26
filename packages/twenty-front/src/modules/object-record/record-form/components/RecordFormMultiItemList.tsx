import { StyledRecordFormFieldBox } from '@/object-record/record-form/components/StyledRecordFormFieldBox';
import { OverlayMenuListSeparator } from '@/ui/layout/overlay/components/OverlayMenuListSeparator';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.betweenSiblingsGap};
  padding: ${themeCssVariables.spacing[1]};
`;

type RecordFormMultiItemListProps = {
  children?: ReactNode;
  footer?: ReactNode;
  hasError?: boolean;
};

export const RecordFormMultiItemList = ({
  children,
  footer,
  hasError = false,
}: RecordFormMultiItemListProps) => (
  <StyledRecordFormFieldBox hasError={hasError}>
    {isDefined(children) && <StyledItems>{children}</StyledItems>}
    {isDefined(children) && isDefined(footer) && <OverlayMenuListSeparator />}
    {footer}
  </StyledRecordFormFieldBox>
);
