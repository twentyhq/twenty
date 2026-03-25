export const getJobKey = ({
  jobName,
  jobId,
}: {
  jobName: string;
  jobId?: string;
}) => {
  return `${jobName}${jobId ? `.${jobId}` : ''}`;
};
