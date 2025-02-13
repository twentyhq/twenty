import { CreateSectorInput } from '@/settings/service-center/sectors/types/CreateSectorInput';

export interface UpdateSectorInput extends CreateSectorInput {
  id: string;
}
