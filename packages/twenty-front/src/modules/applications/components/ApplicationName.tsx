import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';

type ApplicationNameProps = {
  applicationId?: string | null;
};

export const ApplicationName = ({ applicationId }: ApplicationNameProps) => {
  const { applicationChipData } = useApplicationChipData({ applicationId });

  return <>{applicationChipData.name}</>;
};
