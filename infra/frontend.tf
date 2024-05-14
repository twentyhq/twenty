# frontend.tf

resource "azurerm_container_app" "day1ai_front" {
  name                         = local.front_app_name
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  identity {
    type = "SystemAssigned"
  }

  depends_on = [azurerm_container_app.day1ai_server]

  ingress {
    allow_insecure_connections = false
    external_enabled           = true
    target_port                = 3000
    transport                  = "http"
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  template {
    min_replicas = 1
    max_replicas = 1
    container {
      name   = "twenty-front"
      image  = "docker.io/twentycrm/twenty-front:${local.front_tag}"
      cpu    = local.cpu
      memory = local.memory

      env {
        name  = "REACT_APP_SERVER_BASE_URL"
        value = "https://${azurerm_container_app.day1ai_server.ingress[0].fqdn}"
      }
    }
  }
}

# resource "azurerm_container_app_custom_domain" "example" {
#   name                                     = trimprefix(azurerm_dns_txt_record.example.fqdn, "asuid.")
#   container_app_id                         = azurerm_container_app.day1ai_front.id
#   container_app_environment_certificate_id = azurerm_app_service_certificate.cert.id
#   certificate_binding_type                 = "SniEnabled"
# }

# # Add custom domain and managed certificate for SSL
# resource "azapi_update_resource" "custom_domain_ssl" {
#   type        = "Microsoft.App/containerApps@2023-05-01"
#   resource_id = "/subscriptions/e0956760-e1e7-45e5-ac04-ae76c9da09bd/resourceGroups/day1ai-rg/providers/Microsoft.App/containerApps/day1ai-front"
#   body        = jsonencode({
#     properties = {
#       customDomains = [
#         {
#           name = "app.day1ai.com"
#           certificateId = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${azurerm_resource_group.main.name}/providers/Microsoft.KeyVault/vaults/${azurerm_key_vault.keyvault.name}/certificates/${azurerm_key_vault_certificate.keyvault_certificate.name}"
#         }
#       ]
#     }
#   })
# }

# resource "namecheap_domain_records" "subdomain" {
#   domain = local.domain
#   mode = "MERGE"
#   record {
#     hostname = "app"
#     type = "CNAME"
#     address = azurerm_container_app.day1ai_front.ingress[0].fqdn
#     ttl = 60
#   }
# }

output "day1ai_front_url" {
  value = azurerm_container_app.day1ai_front.ingress[0].fqdn
  description = "The URL of the day1ai_front server"
}