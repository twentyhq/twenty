export const INPUT_STYLE = {
  padding: '8px 12px',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  fontSize: 14,
  fontFamily: 'inherit',
};

export const LABEL_STYLE = {
  fontSize: 13,
  fontWeight: 600,
  color: '#374151',
};

export const BUTTON_STYLE = {
  padding: '8px 16px',
  backgroundColor: '#2563eb',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  cursor: 'pointer',
  fontSize: 13,
};

export const SUBJECT_WRAPPER_STYLE = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 6,
};

export const ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

export const FILL_RECT_STYLE = {
  width: '100%',
  height: '100%',
  border: '1px solid #d1d5db',
  borderRadius: 6,
  padding: '8px 12px',
  display: 'block',
  boxSizing: 'border-box' as const,
};

export const FILL_INLINE_STYLE = {
  display: 'inline-block',
  minWidth: 80,
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: 4,
};

export const FILL_BUTTON_STYLE = {
  ...FILL_INLINE_STYLE,
  padding: '8px 16px',
  cursor: 'pointer',
  backgroundColor: '#2563eb',
  color: '#ffffff',
  border: 'none',
};

export const FILL_TABLE_CELL_STYLE = {
  minWidth: 80,
  minHeight: 32,
  padding: '8px 12px',
  border: '1px solid #d1d5db',
};

export const SVG_ROOT_STYLE = {
  width: 200,
  height: 120,
  border: '1px solid #d1d5db',
};
