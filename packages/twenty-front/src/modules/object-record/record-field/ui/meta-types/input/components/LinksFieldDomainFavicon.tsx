import { styled } from '@linaria/react';
import {
  getLogoUrlFromDomainName,
  isValidDomain,
  normalizeDomain,
} from 'twenty-shared/utils';
import { IconWorld } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledFaviconContainer = styled.span`
  align-items: center;
  align-self: stretch;
  border-right: 1px solid ${themeCssVariables.border.color.medium};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: ${themeCssVariables.spacing[8]};
`;

type LinksFieldDomainFaviconProps = {
  domain: string;
};

export const LinksFieldDomainFavicon = ({
  domain,
}: LinksFieldDomainFaviconProps) => {
  const theme = useTheme();

  const faviconUrl = isValidDomain(domain)
    ? getLogoUrlFromDomainName(normalizeDomain(domain))
    : undefined;

  return (
    <StyledFaviconContainer aria-hidden>
      <Avatar.Root size="md" shape="square" backgroundColor="transparent">
        <Avatar.Image src={faviconUrl} alt="" />
        <Avatar.Fallback render={<IconWorld size={theme.icon.size.md} />} />
      </Avatar.Root>
    </StyledFaviconContainer>
  );
};
