import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { SpreadsheetColumns } from '@/spreadsheet-import/types/SpreadsheetColumns';
import { SpreadsheetImportFields } from '@/spreadsheet-import/types/SpreadsheetImportFields';
import { SpreadsheetImportImportValidationResult } from '@/spreadsheet-import/types/SpreadsheetImportImportValidationResult';
import { ImportedRow } from '@/spreadsheet-import/types/SpreadsheetImportImportedRow';
import { ImportedStructuredRow } from '@/spreadsheet-import/types/SpreadsheetImportImportedStructuredRow';
import { SpreadsheetImportRowHook } from '@/spreadsheet-import/types/SpreadsheetImportRowHook';
import { SpreadsheetImportTableHook } from '@/spreadsheet-import/types/SpreadsheetImportTableHook';
import { SpreadsheetImportStep } from '../steps/types/SpreadsheetImportStep';

export type SpreadsheetImportDialogOptions<FieldNames extends string> = {
  // callback when RSI is closed before final submit
  onClose: () => void;
  // Field description for requested data
  fields: SpreadsheetImportFields<FieldNames>;
  // Runs after file upload step, receives and returns raw sheet data
  uploadStepHook?: (importedRows: ImportedRow[]) => Promise<ImportedRow[]>;
  // Runs after header selection step, receives and returns raw sheet data
  selectHeaderStepHook?: (
    headerRow: ImportedRow,
    importedRows: ImportedRow[],
  ) => Promise<{ headerRow: ImportedRow; importedRows: ImportedRow[] }>;
  // Runs once before validation step, used for data mutations and if you want to change how columns were matched
  matchColumnsStepHook?: (
    importedStructuredRows: ImportedStructuredRow<FieldNames>[],
    importedRows: ImportedRow[],
    columns: SpreadsheetColumns<FieldNames>,
  ) => Promise<ImportedStructuredRow<FieldNames>[]>;
  // Runs after column matching and on entry change
  rowHook?: SpreadsheetImportRowHook<FieldNames>;
  // Runs after column matching and on entry change
  tableHook?: SpreadsheetImportTableHook<FieldNames>;
  // Function called after user finishes the flow
  onSubmit: (
    validationResult: SpreadsheetImportImportValidationResult<FieldNames>,
    file: File,
  ) => Promise<void>;
  // Allows submitting with errors. Default: true
  allowInvalidSubmit?: boolean;
  // Theme configuration passed to underlying Chakra-UI
  customTheme?: object;
  // Specifies maximum number of rows for a single import
  maxRecords?: number;
  // Maximum upload filesize (in bytes)
  maxFileSize?: number;
  // Automatically map imported headers to specified fields if possible. Default: true
  autoMapHeaders?: boolean;
  // Headers matching accuracy: 1 for strict and up for more flexible matching
  autoMapDistance?: number;
  // Initial Step state to be rendered on load
  initialStepState?: SpreadsheetImportStep;
  // Sets SheetJS dateNF option. If date parsing is applied, date will be formatted e.g. "yyyy-mm-dd hh:mm:ss", "m/d/yy h:mm", 'mmm-yy', etc.
  dateFormat?: string;
  // Sets SheetJS "raw" option. If true, parsing will only be applied to xlsx date fields.
  parseRaw?: boolean;
  // Use for right-to-left (RTL) support
  rtl?: boolean;
  // Allow header selection
  selectHeader?: boolean;
  availableFieldMetadataItems: FieldMetadataItem[];
};
