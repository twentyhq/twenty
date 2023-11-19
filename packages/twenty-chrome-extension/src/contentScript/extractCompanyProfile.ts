import createNewButton from './createButton';
import extractDomain from './utils/extractDomain';

function insertButtonForCompany(): void {
  const parentDiv: HTMLDivElement | null = document.querySelector('.org-top-card-primary-actions__inner');

  if (parentDiv) {
    const newButtonCompany: HTMLButtonElement = createNewButton('Add to Twenty', () => {
      // Extract company-specific data from the DOM
      const companyNameElement = document.querySelector('.org-top-card-summary__title');
      const domainNameElement = document.querySelector('.org-top-card-primary-actions__inner a');
      const addressElement = document.querySelectorAll('.org-top-card-summary-info-list__info-item')[1];
      const employeesNumberElement = document.querySelectorAll('.org-top-card-summary-info-list__info-item')[3];

      // Get the text content or other necessary data from the DOM elements
      const companyName = companyNameElement ? companyNameElement.getAttribute('title') : '';
      const domainName = extractDomain(domainNameElement && domainNameElement.getAttribute('href'));
      const address = addressElement ? addressElement.textContent?.trim().replace(/\s+/g, ' ') : '';
      const employees = employeesNumberElement ? employeesNumberElement.textContent?.trim().replace(/\s+/g, ' ').split('-')[0] : '';

      // Prepare company data to send to the backend
      const companyData = {
        name: companyName,
        domain: domainName,
        address: address,
        employees: employees,
        linkedInUrl: '',
      };

      chrome.runtime.sendMessage({ message: 'getActiveTabUrl' }, (response) => {
        if (response && response.url) {
          const activeTabUrl: string = response.url;
          // Regular expression to match the company ID
          const regex = /\/company\/([^/]*)/;

          // Extract the company ID using the regex
          const match = activeTabUrl.match(regex);

          if (match && match[1]) {
            const companyID = match[1];
            const cleanCompanyURL = `https://www.linkedin.com/company/${companyID}/`;
            companyData.linkedInUrl = cleanCompanyURL;
          }
        }
      });

      // Simulate backend call with company data
      setTimeout(() => {
        console.log('Sending data to the backend for company:', companyData);
        newButtonCompany.textContent = 'Saved';
      }, 2000);
    });

    parentDiv.prepend(newButtonCompany);
    const buttonSpecificStyles = {
      alignSelf: 'end',
    };

    Object.assign(newButtonCompany.style, buttonSpecificStyles);
  }
}

export default insertButtonForCompany;
