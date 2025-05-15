export enum TraceableFieldSection {
  Sumary = 'Sumary',
  UTM = 'UTM',
  TraceableLinks = 'TraceableLinks',
  Others = 'Others',
}

export const getTraceableFieldSectionLabel = (section: TraceableFieldSection) =>
  ({
    [TraceableFieldSection.Sumary]: 'no-label-sumary',
    [TraceableFieldSection.UTM]: 'UTM',
    [TraceableFieldSection.TraceableLinks]: 'Traceable Links',
    [TraceableFieldSection.Others]: 'no-label-others',
  })[section];
