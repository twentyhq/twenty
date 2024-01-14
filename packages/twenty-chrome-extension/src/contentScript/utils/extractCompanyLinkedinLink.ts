const extractCompanyLinkedinLink = (activeTabUrl: string) => {
  // Regular expression to match the company ID
  const regex = /\/company\/([^/]*)/;

  // Extract the company ID using the regex
  const match = activeTabUrl.match(regex);

  if (match && match[1]) {
    const companyID = match[1];
    const cleanCompanyURL = `https://www.linkedin.com/company/${companyID}`;
    return cleanCompanyURL;
  }

  return '';
};

export default extractCompanyLinkedinLink;
