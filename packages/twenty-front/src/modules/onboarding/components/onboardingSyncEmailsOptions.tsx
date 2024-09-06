import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import styled from '@emotion/styled';

import { MessageChannelVisibility } from '~/generated/graphql';

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  width: ${({ theme }) => theme.spacing(10)};
`;

export const onboardingSyncEmailsOptions = [
  {
    title: 'Tudo',
    description:
      'O conteúdo dos seus emails e eventos será compartilhado com sua equipe.',
    value: MessageChannelVisibility.ShareEverything,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: 'Assunto e metadados',
    description:
      'Os assuntos dos seus emails e títulos de reuniões serão compartilhados com sua equipe.',
    value: MessageChannelVisibility.Subject,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: 'Metadados',
    description:
      'Apenas o carimbo de data/hora e os participantes serão compartilhados com sua equipe.',
    value: MessageChannelVisibility.Metadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];
