import { type CoreViewFieldGroupEssential } from '@/views/types/CoreViewWithRelations';

export type FlatViewFieldGroup = Omit<
  CoreViewFieldGroupEssential,
  'viewFields'
>;
