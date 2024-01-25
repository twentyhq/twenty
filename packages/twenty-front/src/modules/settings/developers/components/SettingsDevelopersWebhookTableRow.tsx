import React from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { WebhookFieldItem } from '@/settings/developers/types/WebhookFieldItem';
import { IconChevronRight } from '@/ui/display/icon';
import { SoonPill } from '@/ui/display/pill/components/SoonPill';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';

export const StyledApisFieldTableRow = styled(TableRow)`
  grid-template-columns: 444px 68px;
`;

const StyledIconTableCell = styled(TableCell)`
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledUrlTableCell = styled(TableCell)`
  color: ${({ theme }) => theme.font.color.primary};
  overflow-x: scroll;
  white-space: nowrap;
`;

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export const SettingsDevelopersWebhookTableRow = ({
  fieldItem,
  onClick,
}: {
  fieldItem: WebhookFieldItem;
  onClick: () => void;
}) => {
  const theme = useTheme();

  const soon = true; // Temporarily disabled while awaiting the development of the feature.
  const onClickAction = !soon ? () => onClick() : undefined;

  return (
    <StyledApisFieldTableRow onClick={onClickAction}>
      <StyledUrlTableCell>{fieldItem.targetUrl}</StyledUrlTableCell>
      <StyledIconTableCell>
        <StyledIconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
        {soon && <SoonPill />}
      </StyledIconTableCell>
    </StyledApisFieldTableRow>
  );
};
