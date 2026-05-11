import { styled } from '@linaria/react';

import { type GetEmailingDomainsQuery } from '~/generated-metadata/graphql';
import { IconMail } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledNameCell = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledDomain = styled.span`
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type SettingsEmailingDomainNameCellProps = {
  item: GetEmailingDomainsQuery['getEmailingDomains'][0];
};

export const SettingsEmailingDomainNameCell = ({
  item,
}: SettingsEmailingDomainNameCellProps) => (
  <StyledNameCell>
    <IconMail size={16} />
    <StyledDomain>{item.domain}</StyledDomain>
  </StyledNameCell>
);
