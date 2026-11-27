import { type FrontComponentRendererPrerequisites } from '@/front-components/types/FrontComponentRendererPrerequisites';
import { createRequiredContext } from '~/utils/createRequiredContext';

export const [
  FrontComponentRendererPrerequisitesProvider,
  useFrontComponentRendererPrerequisitesOrThrow,
] = createRequiredContext<FrontComponentRendererPrerequisites>(
  'FrontComponentRendererPrerequisites',
);
