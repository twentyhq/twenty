// Duplicates minimal twenty-ui Avatar logic for this app.
// Remove once twenty-ui can be imported safely in front components.
import styled from '@emotion/styled';
import { useState } from 'react';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

const AVATAR_COLOR_NAMES = [
  'red',
  'ruby',
  'crimson',
  'tomato',
  'orange',
  'amber',
  'yellow',
  'lime',
  'grass',
  'green',
  'jade',
  'mint',
  'turquoise',
  'cyan',
  'sky',
  'blue',
  'iris',
  'violet',
  'purple',
  'plum',
  'pink',
  'bronze',
  'gold',
  'brown',
  'gray',
] as const;

const StyledAvatar = styled.div<{
  $backgroundColor: string;
  $color: string;
}>`
  align-items: center;
  background: ${({ $backgroundColor }) => $backgroundColor};
  border-radius: 50px;
  box-sizing: border-box;
  color: ${({ $color }) => $color};
  display: flex;
  flex-shrink: 0;
  font-size: ${recordingThemeCssVariables.font.sizeXs};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
  height: 16px;
  justify-content: center;
  line-height: 15px;
  overflow: hidden;
  width: 16px;
`;

const StyledAvatarImage = styled.img`
  height: 100%;
  object-fit: cover;
  width: 100%;
`;

type TranscriptSpeakerAvatarProps = {
  speakerName: string;
  avatarUrl: string | undefined;
  placeholderColorSeed: string;
};

const getSpeakerInitial = (speakerName: string) =>
  speakerName.trim().charAt(0).toUpperCase() || '-';

export const TranscriptSpeakerAvatar = ({
  speakerName,
  avatarUrl,
  placeholderColorSeed,
}: TranscriptSpeakerAvatarProps) => {
  const [erroredAvatarUrl, setErroredAvatarUrl] = useState<
    string | undefined
  >(undefined);

  const shouldShowAvatarImage =
    isNonEmptyString(avatarUrl) && erroredAvatarUrl !== avatarUrl;

  const handleAvatarImageError = () => {
    if (isNonEmptyString(avatarUrl)) {
      setErroredAvatarUrl(avatarUrl);
    }
  };

  const avatarPlaceholderColor = getAvatarPlaceholderColor({
    placeholderColorSeed,
    variant: 12,
  });
  const avatarPlaceholderBackgroundColor = getAvatarPlaceholderColor({
    placeholderColorSeed,
    variant: 4,
  });

  return (
    <StyledAvatar
      aria-hidden="true"
      $backgroundColor={avatarPlaceholderBackgroundColor}
      $color={avatarPlaceholderColor}
    >
      {shouldShowAvatarImage ? (
        <StyledAvatarImage
          src={avatarUrl}
          alt=""
          onError={handleAvatarImageError}
        />
      ) : (
        getSpeakerInitial(speakerName)
      )}
    </StyledAvatar>
  );
};

const getAvatarPlaceholderColor = ({
  placeholderColorSeed,
  variant,
}: {
  placeholderColorSeed: string;
  variant: 4 | 12;
}): string => {
  const avatarColorName =
    AVATAR_COLOR_NAMES[
      Math.abs(hashString(placeholderColorSeed)) % AVATAR_COLOR_NAMES.length
    ];

  return `var(--t-color-${avatarColorName}${variant})`;
};

const hashString = (value: string): number => {
  let hash = 0;

  for (let valueIndex = 0; valueIndex < value.length; valueIndex++) {
    hash = value.charCodeAt(valueIndex) + ((hash << 5) - hash);
  }

  return hash;
};
