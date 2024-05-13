import { MouseEventHandler, useMemo } from 'react';
import styled from '@emotion/styled';

import { FieldLinksValue } from '@/object-record/record-field/types/FieldMetadata';
import { EllipsisDisplay } from '@/ui/field/display/components/EllipsisDisplay';
import { RoundedLink } from '@/ui/navigation/link/components/RoundedLink';
import {
  LinkType,
  SocialLink,
} from '@/ui/navigation/link/components/SocialLink';
import { checkUrlType } from '~/utils/checkUrlType';
import { isDefined } from '~/utils/isDefined';
import { getAbsoluteUrl } from '~/utils/url/getAbsoluteUrl';
import { getUrlHostName } from '~/utils/url/getUrlHostName';

const StyledContainer = styled(EllipsisDisplay)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type LinksDisplayProps = {
  value?: FieldLinksValue;
};

export const LinksDisplay = ({ value }: LinksDisplayProps) => {
  const links = useMemo(
    () =>
      [
        value?.primaryLinkUrl
          ? {
              url: value.primaryLinkUrl,
              label: value.primaryLinkLabel,
            }
          : null,
        ...(value?.secondaryLinks ?? []),
      ]
        .filter(isDefined)
        .map(({ url, label }) => {
          const absoluteUrl = getAbsoluteUrl(url);
          return {
            url: absoluteUrl,
            label: label || getUrlHostName(absoluteUrl),
            type: checkUrlType(absoluteUrl),
          };
        }),
    [value?.primaryLinkLabel, value?.primaryLinkUrl, value?.secondaryLinks],
  );

  const handleClick: MouseEventHandler = (event) => event.stopPropagation();

  return (
    <StyledContainer>
      {links.map(({ url, label, type }, index) =>
        type === LinkType.LinkedIn || type === LinkType.Twitter ? (
          <SocialLink key={index} href={url} onClick={handleClick} type={type}>
            {label}
          </SocialLink>
        ) : (
          <RoundedLink key={index} href={url} onClick={handleClick}>
            {label}
          </RoundedLink>
        ),
      )}
    </StyledContainer>
  );
};
