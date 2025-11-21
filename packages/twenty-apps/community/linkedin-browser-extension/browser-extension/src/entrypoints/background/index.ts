import { onMessage } from "@/utils/messaging";
import { SendMessageOptions } from "@webext-core/messaging";

export default defineBackground(async () => {
    onMessage('openPopup', async () => {
        await browser.action.openPopup();
    })

    onMessage('getPersonviaRelay', async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const {firstName, lastName} = await sendMessage('extractPerson', undefined, {
            tabId: tab.id,
            frameId: 0
        } as SendMessageOptions);

        return {
            firstName,
            lastName
        }
    })

    onMessage('getCompanyviaRelay', async () => {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const {companyName} = await sendMessage('extractCompany', undefined, {
            tabId: tab.id,
            frameId: 0
        } as SendMessageOptions);

        return {
           companyName
        }
    })

    onMessage('createPerson', async ({data}) => {
        const response = await fetch(`${import.meta.env.WXT_TWENTY_API_URL}/s/create/person`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.WXT_TWENTY_API_KEY}`,
          },
          body: JSON.stringify({
            firstName: data.firstName,
            lastName: data.lastName,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return (await response.json()) as {firstName: string; lastName:string;};
    })

    onMessage('createCompany', async ({data}) => {
      const response = await fetch(`${import.meta.env.WXT_TWENTY_API_URL}/s/create/company`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.WXT_TWENTY_API_KEY}`,
        },
        body: JSON.stringify({
          name: data.name
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return (await response.json()) as {name: string};
  })
})
