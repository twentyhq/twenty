import {
  AvatarChip,
  AvatarChipVariant,
  IconApi,
  IconComponent,
  IconCsv,
} from 'twenty-ui';
import { useCreatedByDisplay } from '@/object-record/record-field/meta-types/hooks/useCreatedByFieldDisplay';
import { isNonEmptyString } from '@sniptt/guards';
import { Theme, withTheme } from '@emotion/react';
import { styled } from '@linaria/react';
import { useMemo } from 'react';

const StyledLeftIconContainer = withTheme(styled.div<{ theme: Theme }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.background.invertedSecondary};
`);

const createLeftIcon = (Icon: IconComponent): IconComponent => {
  return (props) => (
    <StyledLeftIconContainer>
      <Icon color="white" size={props.size} stroke={props.stroke} />
    </StyledLeftIconContainer>
  );
};
const LeftApiIcon = createLeftIcon(IconApi);
const LeftCsvIcon = createLeftIcon(IconCsv);

export const CreatedByDisplay = () => {
  const { fieldValue } = useCreatedByDisplay();

  const name = !fieldValue.workspaceMemberId
    ? fieldValue.name
    : [
        fieldValue.workspaceMember?.name.firstName,
        fieldValue.workspaceMember?.name.lastName,
      ]
        .filter(isNonEmptyString)
        .join(' ');

  const LeftIcon = useMemo(() => {
    switch (fieldValue.source) {
      case 'API':
        return LeftApiIcon;
      case 'CSV':
        return LeftCsvIcon;
      default:
        return undefined;
    }
  }, [fieldValue.source]);

  return (
    <AvatarChip
      placeholderColorSeed={fieldValue.workspaceMemberId}
      name={name ?? ''}
      avatarType={fieldValue.workspaceMemberId ? 'rounded' : 'squared'}
      LeftIcon={LeftIcon}
      avatarUrl={fieldValue.workspaceMember?.avatarUrl ?? ''}
      variant={AvatarChipVariant.Transparent}
    />
  );
};
