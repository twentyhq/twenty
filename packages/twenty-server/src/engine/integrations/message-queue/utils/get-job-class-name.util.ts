export function getJobClassName(name: string): string {
  const [, jobName] = name.split('.') ?? [];

  return jobName ?? name;
}
