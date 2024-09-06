import { useNavigate } from 'react-router-dom';
import { IconPlus, IconSettings } from 'twenty-ui';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Button } from '@/ui/input/button/components/Button';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import {
  AnimatedPlaceholderEmptyContainer,
  AnimatedPlaceholderEmptySubTitle,
  AnimatedPlaceholderEmptyTextContainer,
  AnimatedPlaceholderEmptyTitle,
} from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';

type RecordTableEmptyStateProps = {
  objectNameSingular: string;
  objectLabel: string;
  createRecord: () => void;
  isRemote: boolean;
};

export const RecordTableEmptyState = ({
  objectNameSingular,
  objectLabel,
  createRecord,
  isRemote,
}: RecordTableEmptyStateProps) => {
  const navigate = useNavigate();
  const { totalCount } = useFindManyRecords({ objectNameSingular, limit: 1 });
  const noExistingRecords = totalCount === 0;

  const [title, subTitle, Icon, onClick, buttonTitle] = isRemote
    ? [
        'Nenhum Dado Disponível para a Tabela Remota',
        'Se isso for inesperado, verifique suas configurações.',
        IconSettings,
        () => navigate('/settings/integrations'),
        'Ir para Configurações',
      ]
    : [
        noExistingRecords
          ? `Adicione seu primeiro ${objectLabel}`
          : `Nenhum ${objectLabel} encontrado`,
        noExistingRecords
          ? `Use nossa API ou adicione seu primeiro ${objectLabel} manualmente`
          : 'Nenhum registro correspondente aos critérios de filtro foi encontrado.',
        IconPlus,
        createRecord,
        `Adicionar um ${objectLabel}`,
      ];

  return (
    <AnimatedPlaceholderEmptyContainer>
      <AnimatedPlaceholder type="noRecord" />
      <AnimatedPlaceholderEmptyTextContainer>
        <AnimatedPlaceholderEmptyTitle>{title}</AnimatedPlaceholderEmptyTitle>
        <AnimatedPlaceholderEmptySubTitle>
          {subTitle}
        </AnimatedPlaceholderEmptySubTitle>
      </AnimatedPlaceholderEmptyTextContainer>
      <Button
        Icon={Icon}
        title={buttonTitle}
        variant={'secondary'}
        onClick={onClick}
      />
    </AnimatedPlaceholderEmptyContainer>
  );
};
