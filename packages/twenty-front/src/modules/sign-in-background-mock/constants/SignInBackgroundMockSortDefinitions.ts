import { COMPANY_LABEL_IDENTIFIER_FIELD_METADATA_ID } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';

export const SIGN_IN_BACKGROUND_MOCK_SORT_DEFINITIONS = [
  {
    fieldMetadataId: '20202020-5e4e-4007-a630-8a2617914889',
    label: 'Domínio',
    iconName: 'IconLink',
  },
  {
    fieldMetadataId: '20202020-7fbd-41ad-b64d-25a15ff62f04',
    label: 'Funcionários',
    iconName: 'IconUsers',
  },
  {
    fieldMetadataId: COMPANY_LABEL_IDENTIFIER_FIELD_METADATA_ID,
    label: 'Nome',
    iconName: 'IconBuildingSkyscraper',
  },
  {
    fieldMetadataId: '20202020-ad10-4117-a039-3f04b7a5f939',
    label: 'Endereço',
    iconName: 'IconMap',
  },
  {
    fieldMetadataId: '20202020-4dc2-47c9-bb15-6e6f19ba9e46',
    label: 'Data de Criação',
    iconName: 'IconCalendar',
  },
  {
    fieldMetadataId: '20202020-9e9f-4235-98b2-c76f3e2d281e',
    label: 'ICP',
    iconName: 'IconTarget',
  },
] as SortDefinition[];
