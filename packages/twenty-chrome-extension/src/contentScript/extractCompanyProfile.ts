import handleQueryParams from '../utils/handleQueryParams';
import requestDb from '../utils/requestDb';
import createNewButton from './createButton';
import extractCompanyLinkedinLink from './utils/extractCompanyLinkedinLink';
import extractDomain from './utils/extractDomain';

function insertButtonForCompany(): void {
  const parentDiv: HTMLDivElement | null = document.querySelector(
    '.org-top-card-primary-actions__inner',
  );

  if (parentDiv) {
    const newButtonCompany: HTMLButtonElement = createNewButton(
      'Add to Twenty',
      async () => {
        // Extract company-specific data from the DOM
        const companyNameElement = document.querySelector(
          '.org-top-card-summary__title',
        );
        const domainNameElement = document.querySelector(
          '.org-top-card-primary-actions__inner a',
        );
        const addressElement = document.querySelectorAll(
          '.org-top-card-summary-info-list__info-item',
        )[1];
        const employeesNumberElement = document.querySelectorAll(
          '.org-top-card-summary-info-list__info-item',
        )[3];

        // Get the text content or other necessary data from the DOM elements
        const companyName = companyNameElement
          ? companyNameElement.getAttribute('title')
          : '';
        const domainName = extractDomain(
          domainNameElement && domainNameElement.getAttribute('href'),
        );
        const address = addressElement
          ? addressElement.textContent?.trim().replace(/\s+/g, ' ')
          : '';
        const employees = employeesNumberElement
          ? Number(
              employeesNumberElement.textContent
                ?.trim()
                .replace(/\s+/g, ' ')
                .split('-')[0],
            )
          : 0;

        // Prepare company data to send to the backend
        const companyData = {
          name: companyName,
          domainName: domainName,
          address: address,
          employees: employees,
          linkedinLink: { url: '', label: '' },
        };

        // Extract active tab url using chrome API.
        const { url: activeTabUrl } = await chrome.runtime.sendMessage({
          action: 'getActiveTabUrl',
        });

        // Convert URLs like https://www.linkedin.com/company/twenty/about/ to https://www.linkedin.com/company/twenty
        const companyURL = extractCompanyLinkedinLink(activeTabUrl);
        companyData.linkedinLink = { url: companyURL, label: companyURL };

        const query = `mutation CreateOneCompany { createCompany(data:{${handleQueryParams(
          companyData,
        )}}) {id} }`;

        const response = await requestDb(query);

        if (response.data) {
          newButtonCompany.textContent = 'Saved';
          newButtonCompany.setAttribute('disabled', 'true');

          newButtonCompany.addEventListener('mouseenter', () => {
            const hoverStyles = {
              backgroundColor: 'black',
              borderColor: 'black',
              cursor: 'default',
            };
            Object.assign(newButtonCompany.style, hoverStyles);
          });
        } else {
          newButtonCompany.textContent = 'Try Again';
        }
      },
    );

    parentDiv.prepend(newButtonCompany);
    const buttonSpecificStyles = {
      alignSelf: 'end',
    };

    Object.assign(newButtonCompany.style, buttonSpecificStyles);
  }
}

export default insertButtonForCompany;
