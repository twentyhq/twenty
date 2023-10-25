import { FieldMetadata } from '@/ui/data/field/types/FieldMetadata';
import { Filter } from '@/ui/data/view-bar/types/Filter';
import { Sort } from '@/ui/data/view-bar/types/Sort';
import { ScopedStateKey } from '@/ui/utilities/recoil-scope/scopes-internal/types/ScopedStateKey';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

type ViewScopeInternalContextProps = ScopedStateKey & {
  defaultViewName?: string;
  onViewSortsChange?: (sorts: Sort[]) => void | Promise<void>;
  onViewFiltersChange?: (filters: Filter[]) => void | Promise<void>;
  onViewFieldsChange?: (fields: FieldMetadata[]) => void | Promise<void>;
  onImport?: () => void | Promise<void>;
};

export const ViewScopeInternalContext =
  createScopeInternalContext<ViewScopeInternalContextProps>();
