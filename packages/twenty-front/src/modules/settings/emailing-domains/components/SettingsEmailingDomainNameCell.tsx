import { styled } from '@linaria/react';

import { type GetEmailingDomainsQuery } from '~/generated-metadata/graphql';
import { IconMail, OverflowingTextWithTooltip } from 'twenty-ui-deprecated/display';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

type SettingsEmailingDomainNameCellProps = {
  item: GetEmailingDomainsQuery['getEmailingDomains'][0];
};

export const SettingsEmailingDomainNameCell = ({
  item,
}: SettingsEmailingDomainNameCellProps) => (
  <StyledNameCell>
    <IconMail size={16} />
    <OverflowingTextWithTooltip text={item.domain} />
  </StyledNameCell>
);
