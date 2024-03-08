import createNewButton from '~/contentScript/createButton';
import extractCompanyLinkedinLink from '~/contentScript/utils/extractCompanyLinkedinLink';
import extractDomain from '~/contentScript/utils/extractDomain';
import { createCompany, fetchCompany } from '~/db/company.db';
import { CompanyInput } from '~/db/types/company.types';

const insertButtonForCompany = async (): Promise<void> => {
  // Select the element in which to create the button.
  const parentDiv: HTMLDivElement | null = document.querySelector(
    '.org-top-card-primary-actions__inner',
  );

  // Create the button with desired callback funciton to execute upon click.
  if (parentDiv) {
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
    const companyInputData: CompanyInput = {
      name: companyName ?? '',
      domainName: domainName,
      address: address ?? '',
      employees: employees,
    };

    // Extract active tab url using chrome API - an event is triggered here and is caught by background script.
    const { url: activeTabUrl } = await chrome.runtime.sendMessage({
      action: 'getActiveTabUrl',
    });

    // Convert URLs like https://www.linkedin.com/company/twenty/about/ to https://www.linkedin.com/company/twenty
    const companyURL = extractCompanyLinkedinLink(activeTabUrl);
    companyInputData.linkedinLink = { url: companyURL, label: companyURL };

    const company = await fetchCompany({
      linkedinLink: {
        url: { eq: companyURL },
        label: { eq: companyURL },
      },
    });
    if (company) {
      const savedCompany: HTMLDivElement = createNewButton(
        'Saved',
        async () => {},
      );
      // Include the button in the DOM.
      parentDiv.prepend(savedCompany);

      // Write button specific styles here - common ones can be found in createButton.ts.
      const buttonSpecificStyles = {
        alignSelf: 'end',
      };

      Object.assign(savedCompany.style, buttonSpecificStyles);
    } else {
      const newButtonCompany: HTMLDivElement = createNewButton(
        'Add to Twenty',
        async () => {
          const response = await createCompany(companyInputData);

          if (response) {
            newButtonCompany.textContent = 'Saved';
            newButtonCompany.setAttribute('disabled', 'true');

            // Button specific styles once the button is unclickable after successfully sending data to server.
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

      // Include the button in the DOM.
      parentDiv.prepend(newButtonCompany);

      // Write button specific styles here - common ones can be found in createButton.ts.
      const buttonSpecificStyles = {
        alignSelf: 'end',
      };

      Object.assign(newButtonCompany.style, buttonSpecificStyles);
    }
  }
};

export default insertButtonForCompany;
