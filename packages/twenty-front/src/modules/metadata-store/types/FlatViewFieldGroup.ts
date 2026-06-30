import { type ViewFieldGroupEssential } from '@/views/types/ViewWithRelations';

export type FlatViewFieldGroup = Omit<ViewFieldGroupEssential, 'viewFields'>;
