import type { MyProfilePayload } from '../my-profile/types';

export type CaseStudyRow = {
  key: string; // stable React key: the record id for saved rows, `draft-N` for new ones
  id?: string; // present once persisted
  clientName: string;
  headline: string;
  bodyMarkdown: string;
  caseStudyLink: string;
  coverImageUrl: string;
  published: boolean;
};

export const derivePublished = (status: string | null): boolean => status === 'APPROVED';

export const buildInitialRows = (
  caseStudies: MyProfilePayload['caseStudies'],
): CaseStudyRow[] =>
  caseStudies.map((cs) => ({
    key: cs.id,
    id: cs.id,
    clientName: cs.clientName ?? '',
    headline: cs.headline ?? '',
    bodyMarkdown: cs.bodyMarkdown ?? '',
    caseStudyLink: cs.caseStudyLink ?? '',
    coverImageUrl: cs.coverImageUrl ?? '',
    published: derivePublished(cs.status),
  }));

let draftCounter = 0;
export const newDraftRow = (): CaseStudyRow => ({
  key: `draft-${(draftCounter += 1)}`,
  clientName: '',
  headline: '',
  bodyMarkdown: '',
  caseStudyLink: '',
  coverImageUrl: '',
  published: false,
});

// The internal `name` column is required server-side but never shown to partners; derive it.
export const deriveName = (row: CaseStudyRow): string =>
  row.headline.trim() !== '' ? row.headline.trim() : 'Case study';

export const isBlankDraft = (row: CaseStudyRow): boolean =>
  row.id === undefined &&
  row.headline.trim() === '' &&
  row.bodyMarkdown.trim() === '' &&
  row.clientName.trim() === '' &&
  row.caseStudyLink.trim() === '' &&
  row.coverImageUrl.trim() === '';

// The reconcile route needs the whole desired list; blank never-saved drafts are excluded
// so an untouched "Add" doesn't create an empty record.
export const toSaveBody = (rows: CaseStudyRow[]): Record<string, unknown> => ({
  caseStudies: rows
    .filter((row) => !isBlankDraft(row))
    .map((row) => ({
      ...(row.id ? { id: row.id } : {}),
      name: deriveName(row),
      clientName: row.clientName,
      headline: row.headline,
      bodyMarkdown: row.bodyMarkdown,
      caseStudyLink: row.caseStudyLink,
      coverImageUrl: row.coverImageUrl,
      published: row.published,
    })),
});
