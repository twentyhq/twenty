import { StyledFieldInputPrefix } from '@/ui/field/input/components/StyledFieldInputPrefix';
import {
  getLogoUrlFromDomainName,
  isValidDomain,
  normalizeDomain,
} from 'twenty-shared/utils';
import { IconWorld } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme';

type FieldInputDomainFaviconPrefixProps = {
  domain: string;
};

export const FieldInputDomainFaviconPrefix = ({
  domain,
}: FieldInputDomainFaviconPrefixProps) => {
  const theme = useTheme();

  const faviconUrl = isValidDomain(domain)
    ? getLogoUrlFromDomainName(normalizeDomain(domain))
    : undefined;

  return (
    <StyledFieldInputPrefix aria-hidden>
      <Avatar.Root size="md" shape="square" backgroundColor="transparent">
        <Avatar.Image src={faviconUrl} alt="" />
        <Avatar.Fallback render={<IconWorld size={theme.icon.size.md} />} />
      </Avatar.Root>
    </StyledFieldInputPrefix>
  );
};
